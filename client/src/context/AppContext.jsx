import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

const RESULT_KEY = "geopharma_last_result";
const LOCATION_KEY = "geopharma_location";

function readJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Short plain-text summary of the prescription handed to the chat assistant as context.
export function summarizeForChat(result) {
  if (!result || !result.isPrescription) return "";
  const lines = [];
  if (result.patient?.name) lines.push(`Patient: ${[result.patient.name, result.patient.age, result.patient.gender].filter(Boolean).join(", ")}`);
  if (result.doctor?.name) lines.push(`Doctor: ${result.doctor.name}`);
  if (result.date) lines.push(`Date: ${result.date}`);
  if (result.diagnoses?.length) lines.push(`Diagnoses: ${result.diagnoses.join("; ")}`);
  (result.medicines || []).forEach((m, i) => {
    lines.push(
      `${i + 1}. ${m.name}${m.strength ? " " + m.strength : ""} | dose ${m.dose || "n/a"} | ${m.durationText || (m.durationDays ? m.durationDays + " days" : "duration n/a")} | ${m.food}${m.purpose ? " | " + m.purpose : ""}`
    );
  });
  if (result.interactions?.length) {
    lines.push("Possible interactions: " + result.interactions.map((i) => `${i.medicines.join(" + ")} (${i.severity}): ${i.note}`).join(" / "));
  }
  return lines.join("\n");
}

export function AppProvider({ children }) {
  const [result, setResultState] = useState(() => readJson(RESULT_KEY));
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [location, setLocationState] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_KEY) || "";
    } catch {
      return "";
    }
  });

  const setResult = useCallback((next) => {
    setResultState(next);
    try {
      if (next) sessionStorage.setItem(RESULT_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(RESULT_KEY);
    } catch {
      /* storage full or blocked — in-memory state still works */
    }
  }, []);

  const setLocation = useCallback((value) => {
    setLocationState(value);
    try {
      if (value) localStorage.setItem(LOCATION_KEY, value);
      else localStorage.removeItem(LOCATION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Open the assistant, optionally with a question already queued up.
  const openChat = useCallback((prompt) => {
    if (prompt) setPendingPrompt(prompt);
    setChatOpen(true);
  }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const clearPendingPrompt = useCallback(() => setPendingPrompt(null), []);

  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setChatOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  const value = useMemo(
    () => ({
      result,
      setResult,
      chatOpen,
      openChat,
      closeChat,
      pendingPrompt,
      clearPendingPrompt,
      location,
      setLocation,
    }),
    [result, setResult, chatOpen, openChat, closeChat, pendingPrompt, clearPendingPrompt, location, setLocation]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
