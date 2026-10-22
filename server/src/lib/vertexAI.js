import { GoogleAuth } from "google-auth-library";

// Cheapest Gemini 2.5 model on Vertex AI. Override with GEMINI_MODEL in .env if needed.
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

let credentials = null;
let clientPromise = null;

function loadCredentials() {
  if (credentials) return credentials;

  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");

  raw = raw.trim();
  // tolerate values pasted with surrounding quotes
  if (
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"') && raw[1] === "{")
  ) {
    raw = raw.slice(1, -1);
  }
  // also accept a base64-encoded JSON (handy for CI / Vercel)
  if (!raw.startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");

  const parsed = JSON.parse(raw);
  if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  credentials = parsed;
  return credentials;
}

async function getAccessToken() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const auth = new GoogleAuth({
        credentials: loadCredentials(),
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
      return auth.getClient();
    })().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  const client = await clientPromise;
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("Could not obtain a Google access token");
  return token;
}

function modelUrl() {
  const creds = loadCredentials();
  const project = process.env.GOOGLE_PROJECT_ID || creds.project_id;
  const location = process.env.GOOGLE_LOCATION || "us-central1";
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const host = location === "global" ? "aiplatform.googleapis.com" : `${location}-aiplatform.googleapis.com`;
  return `https://${host}/v1/projects/${project}/locations/${location}/publishers/google/models/${model}`;
}

// Medical text can trip the default filters; only block clearly harmful output.
const SAFETY_SETTINGS = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
].map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" }));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(method, body, { signal, query = "" } = {}) {
  const token = await getAccessToken();
  return fetch(`${modelUrl()}:${method}${query}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
}

function aiError(res, detail) {
  const err = new Error(`Vertex AI request failed (${res.status})`);
  err.status = res.status;
  err.detail = detail;
  return err;
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p) => p.text || "").join("");
}

/**
 * Ask Gemini for structured JSON.
 * `parts` is the user content: [{ text }, { inlineData: { mimeType, data } }, ...]
 */
export async function generateJSON({
  parts,
  system,
  schema,
  temperature = 0.2,
  maxOutputTokens = 8192,
  signal,
}) {
  const build = (withSchema) => ({
    contents: [{ role: "user", parts }],
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
      ...(withSchema && schema ? { responseSchema: schema } : {}),
    },
    safetySettings: SAFETY_SETTINGS,
  });

  let useSchema = Boolean(schema);
  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await post("generateContent", build(useSchema), { signal });

    if (res.ok) {
      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const text = extractText(data);
      if (!text) {
        const reason = data?.promptFeedback?.blockReason || candidate?.finishReason || "empty";
        const err = new Error(`Gemini returned no content (${reason})`);
        err.status = 422;
        throw err;
      }
      try {
        return JSON.parse(text);
      } catch {
        const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
        try {
          return JSON.parse(cleaned);
        } catch {
          const err = new Error("Gemini returned malformed JSON");
          err.status = 502;
          throw err;
        }
      }
    }

    const detail = await res.text();
    lastError = aiError(res, detail);

    // Some very large schemas are rejected — retry once without the schema.
    if (res.status === 400 && useSchema && /schema|constraint|states/i.test(detail)) {
      console.warn("Gemini rejected responseSchema, retrying without it");
      useSchema = false;
      continue;
    }
    if ([429, 500, 502, 503, 504].includes(res.status)) {
      await sleep(700 * 2 ** attempt);
      continue;
    }
    break;
  }
  throw lastError;
}

/**
 * Stream plain text from Gemini. Calls onToken(text) for every chunk.
 * `contents` is the full chat history in Gemini format.
 */
export async function streamText({
  contents,
  system,
  temperature = 0.4,
  maxOutputTokens = 900,
  signal,
  onToken,
}) {
  const body = {
    contents,
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    generationConfig: { temperature, maxOutputTokens },
    safetySettings: SAFETY_SETTINGS,
  };

  let res;
  for (let attempt = 0; attempt < 2; attempt++) {
    res = await post("streamGenerateContent", body, { signal, query: "?alt=sse" });
    if (res.ok) break;
    if ([429, 503].includes(res.status) && attempt === 0) {
      await sleep(800);
      continue;
    }
    throw aiError(res, await res.text());
  }

  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  let buffer = "";
  let full = "";

  const handleLine = (line) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    try {
      const chunk = JSON.parse(payload);
      const text = extractText(chunk);
      if (text) {
        full += text;
        onToken(text);
      }
    } catch {
      // ignore partial / non-JSON keep-alive lines
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    lines.forEach(handleLine);
  }
  if (buffer) handleLine(buffer);

  return full;
}

export function aiConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}
