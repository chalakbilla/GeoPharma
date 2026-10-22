import { baseURL, getToken } from "./api";

/**
 * POST the conversation to /api/chat and read the server-sent events as they arrive.
 * Calls onToken(text) for each chunk. Resolves when the stream finishes.
 */
export async function streamChat({ messages, context, signal, onToken }) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseURL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, context }),
    signal,
  });

  if (!res.ok) {
    let message = "Sorry, the assistant isn't available right now.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleEvent = (block) => {
    const line = block.split("\n").find((l) => l.startsWith("data:"));
    if (!line) return;
    let payload;
    try {
      payload = JSON.parse(line.slice(5).trim());
    } catch {
      return;
    }
    if (payload.error) throw new Error(payload.error);
    if (payload.t) onToken(payload.t);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop();
    blocks.forEach(handleEvent);
  }
  if (buffer.trim()) handleEvent(buffer);
}
