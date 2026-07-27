import { GoogleAuth } from "google-auth-library";

let authClient = null;

async function getAccessToken() {
  if (!authClient) {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is not set");
    }
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    authClient = await auth.getClient();
  }
  const { token } = await authClient.getAccessToken();
  return token;
}

const MODEL = "gemini-2.5-flash-lite";

const PROMPT = `You are reading a photo of a doctor's prescription for an Indian pharmacy.

Extract everything readable from the image and return ONLY valid JSON in this exact shape,
with no markdown fences and no extra commentary:

{
  "extractedText": "full raw text you can read off the prescription, as plain text",
  "diseases": [
    { "name": "condition or diagnosis mentioned or implied", "medicines": ["medicine name 1", "medicine name 2"] }
  ]
}

Rules:
- If the image is not a prescription, or is unreadable, set "extractedText" to a short explanation and return "diseases": [].
- Only include medicines you can actually see written or that a doctor would clearly prescribe for a named condition on the page — don't invent unrelated ones.
- If no specific disease/diagnosis is written, group medicines under a "diseases" entry named "General / as prescribed".`;

export async function analyzePrescriptionImage(base64Data, mimeType) {
  const token = await getAccessToken();
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION || "us-central1";

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${MODEL}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: PROMPT }, { inlineData: { mimeType, data: base64Data } }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vertex AI request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error("Vertex AI returned no content — the image may have been blocked or empty");
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error("Vertex AI response wasn't valid JSON, try re-uploading the image");
  }
}

export async function analyzePrescriptionText(text) {
  const token = await getAccessToken();
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION || "us-central1";

  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${MODEL}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${PROMPT}\n\nHere is the prescription text to work from instead of an image:\n"""${text}"""`,
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vertex AI request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Vertex AI returned no content");
  return JSON.parse(raw);
}
