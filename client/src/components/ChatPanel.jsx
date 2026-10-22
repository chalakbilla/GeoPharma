import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiMic, FiPlus, FiSend, FiSquare, FiX } from "react-icons/fi";
import Markdown from "../lib/markdown";
import { streamChat } from "../lib/chatStream";
import { summarizeForChat, useApp } from "../context/AppContext";

const STORAGE_KEY = "geopharma_chat";

const GENERAL_PROMPTS = [
  "What is Paracetamol used for?",
  "Generic vs branded medicines — what's the difference?",
  "How do I read a prescription?",
  "Medicines that shouldn't be taken together?",
];
const RX_PROMPTS = [
  "Explain my prescription in simple words",
  "Make a daily routine for my medicines",
  "Any interactions I should know about?",
  "Which medicines have cheaper generic options?",
];

function loadMessages() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ChatPanel = ({ variant = "floating", onClose }) => {
  const { result, pendingPrompt, clearPendingPrompt } = useApp();
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");

  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendRef = useRef(null);

  const hasRx = Boolean(result?.isPrescription && result.medicines?.length);
  const suggestions = hasRx ? RX_PROMPTS : GENERAL_PROMPTS;

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* ignore */
    }
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, error]);

  // stop streaming / listening if the panel unmounts
  useEffect(
    () => () => {
      abortRef.current?.abort();
      recognitionRef.current?.stop?.();
    },
    []
  );

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const send = useCallback(
    async (text) => {
      const content = (text || "").trim();
      if (!content || streaming) return;

      setError(null);
      const history = [...messages, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      requestAnimationFrame(resizeInput);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          messages: history.map(({ role, content: c }) => ({ role, content: c })),
          context: summarizeForChat(result),
          signal: controller.signal,
          onToken: (t) =>
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { ...last, content: last.content + t };
              return copy;
            }),
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Sorry, something went wrong. Please try again.");
        }
      } finally {
        // drop an empty assistant bubble (error or stopped before any text)
        setMessages((prev) =>
          prev.length && prev[prev.length - 1].role === "assistant" && !prev[prev.length - 1].content
            ? prev.slice(0, -1)
            : prev
        );
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, result]
  );
  sendRef.current = send;

  // A question queued from elsewhere in the app ("Ask AI" buttons).
  // Deferred a tick so React StrictMode's dev-only mount/unmount/mount doesn't abort the stream.
  useEffect(() => {
    if (!pendingPrompt) return undefined;
    const timer = setTimeout(() => {
      clearPendingPrompt();
      sendRef.current?.(pendingPrompt);
    }, 0);
    return () => clearTimeout(timer);
  }, [pendingPrompt, clearPendingPrompt]);

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const toggleVoice = () => {
    if (!SpeechRecognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(text);
      requestAnimationFrame(resizeInput);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const shell =
    variant === "floating"
      ? "no-print fixed bottom-5 right-5 z-50 flex h-[min(640px,calc(100dvh-2.5rem))] w-[min(410px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_60px_-12px_rgba(15,36,56,0.35)] max-sm:inset-0 max-sm:h-auto max-sm:w-auto max-sm:rounded-none"
      : "card flex h-[calc(100dvh-190px)] min-h-[520px] flex-col overflow-hidden";

  return (
    <section className={shell} aria-label="GeoPharma AI assistant">
      <header className="flex items-center gap-3 bg-gradient-to-r from-brand to-brand-light px-4 py-3 text-white">
        <img src="/logo.png" alt="" className="h-9 w-9 rounded-full bg-white p-1 object-contain" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-sans text-[15px] font-bold">GeoPharma Assistant</p>
          <p className="text-xs text-white/80">AI pharmacy helper · English / हिंदी</p>
        </div>
        <button onClick={newChat} title="New chat" aria-label="New chat" className="rounded-lg p-2 hover:bg-white/15">
          <FiPlus />
        </button>
        {onClose && (
          <button onClick={onClose} title="Close" aria-label="Close chat" className="rounded-lg p-2 hover:bg-white/15">
            <FiX />
          </button>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7fbf9] px-4 py-4">
        {messages.length === 0 && (
          <div className="fade-up pt-2 text-center">
            <p className="text-lg font-bold text-ink">
              {hasRx ? "Ask me about your prescription" : "How can I help you today?"}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
              {hasRx
                ? "I can see the medicines we just read for you."
                : "Ask about medicines, how to take them, or how to use GeoPharma."}
            </p>
            <div className="mt-5 grid gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-line bg-white px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:border-brand-light hover:bg-mint"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const waiting = streaming && i === messages.length - 1 && !m.content;
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[14.5px] ${
                  isUser
                    ? "rounded-br-md bg-brand text-white"
                    : "rounded-bl-md border border-line bg-white text-ink shadow-sm"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : waiting ? (
                  <div className="flex items-center gap-1 py-1.5" aria-label="Assistant is typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                ) : (
                  <Markdown text={m.content} />
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger-dark">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-line bg-white p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-[#f7faf8] p-2 focus-within:border-brand-light focus-within:bg-white">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeInput();
            }}
            onKeyDown={onKeyDown}
            placeholder={listening ? "Listening…" : "Ask about a medicine…"}
            maxLength={2000}
            className="max-h-36 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-ink-soft"
            aria-label="Message"
          />
          {SpeechRecognition && (
            <>
              <button
                type="button"
                onClick={() => setVoiceLang((l) => (l === "en-IN" ? "hi-IN" : "en-IN"))}
                title="Voice language"
                className="rounded-lg px-1.5 py-2 text-xs font-bold text-ink-soft hover:text-brand"
              >
                {voiceLang === "en-IN" ? "EN" : "हि"}
              </button>
              <button
                type="button"
                onClick={toggleVoice}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                className={`rounded-xl p-2.5 ${listening ? "bg-danger text-white" : "text-ink-soft hover:bg-mint hover:text-brand"}`}
              >
                <FiMic />
              </button>
            </>
          )}
          {streaming ? (
            <button type="button" onClick={stop} aria-label="Stop generating" className="rounded-xl bg-ink p-2.5 text-white">
              <FiSquare />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              aria-label="Send message"
              className="rounded-xl bg-brand p-2.5 text-white transition hover:bg-brand-dark disabled:opacity-40"
            >
              <FiSend />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-soft">
          AI can make mistakes — confirm with your doctor or pharmacist. Emergency? Call 112.
        </p>
      </div>
    </section>
  );
};

export default ChatPanel;
