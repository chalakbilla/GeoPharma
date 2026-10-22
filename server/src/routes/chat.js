import { Router } from "express";
import { streamText } from "../lib/vertexAI.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const SYSTEM_PROMPT = `You are GeoPharma Assistant, a friendly and careful pharmacy helper for customers of an Indian online pharmacy.

How to answer:
- Be concise and clear: short paragraphs, bullet points for steps or lists, simple words. Use **bold** sparingly for key terms.
- Reply in the user's language (English, Hindi or Hinglish — match what they write).
- Use Indian context: brand and generic names sold in India, rupees, Indian emergency numbers (112 for emergencies, 108 for ambulance).

You can:
- Explain what a medicine is used for, how it is usually taken, common side effects, precautions and generic vs brand differences.
- Explain the user's uploaded prescription (provided below as context, if any), build a simple daily routine from it, point out possible interactions and unclear items.
- Give general wellness and over-the-counter guidance.

You must:
- Never diagnose, and never tell anyone to start, stop or change the dose of a prescribed medicine — say to confirm with their doctor or pharmacist.
- If the message mentions red-flag symptoms (chest pain, trouble breathing, signs of stroke, severe allergic reaction, heavy bleeding, fainting, suicidal thoughts, overdose, a child or pregnant person in distress), tell them to call 112 or go to the nearest hospital right away, before anything else.
- Be extra careful about doses for children, pregnancy, breastfeeding, kidney/liver disease and elderly people: don't give exact doses, advise a doctor.
- Never invent prices, stock, delivery or order status. If you don't know, say so plainly.
- For medicine-specific answers end with one short line reminding them to confirm with their doctor or pharmacist. Skip that for greetings and small talk.
- Stay on health, medicines and using GeoPharma. Politely decline unrelated requests.`;

const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

function toContents(messages) {
  const cleaned = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.text)
    .slice(-MAX_MESSAGES);

  // Gemini wants the conversation to start with a user turn.
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  return cleaned.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
}

router.post("/", rateLimit({ windowMs: 60_000, max: 20, name: "chat" }), async (req, res) => {
  const contents = toContents(req.body?.messages);
  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send at least one message" });
  }

  const context = typeof req.body?.context === "string" ? req.body.context.slice(0, 6000) : "";
  const system = context
    ? `${SYSTEM_PROMPT}\n\nThe user's uploaded prescription (AI-extracted, may contain mistakes):\n${context}`
    : SYSTEM_PROMPT;

  res.status(200);
  res.set({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  // Stop paying for tokens if the user closes the tab or hits "stop".
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    await streamText({
      contents,
      system,
      signal: controller.signal,
      onToken: (t) => send({ t }),
    });
    send({ done: true });
  } catch (err) {
    if (controller.signal.aborted) return;
    console.error("Chat failed:", err.message, err.detail || "");
    send({
      error:
        err.status === 429 || err.status === 503
          ? "The assistant is busy right now. Please try again in a few seconds."
          : "Sorry, I couldn't answer that. Please try again.",
    });
  } finally {
    res.end();
  }
});

export default router;
