import React from "react";
import { useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import ChatPanel from "./ChatPanel";
import { useApp } from "../context/AppContext";

// Floating "Ask AI" button + popup chat, available on every page except /assistant.
const ChatWidget = () => {
  const { chatOpen, openChat, closeChat } = useApp();
  const { pathname } = useLocation();

  if (pathname === "/assistant") return null;

  return (
    <>
      {chatOpen && <ChatPanel variant="floating" onClose={closeChat} />}
      {!chatOpen && (
        <button
          onClick={() => openChat()}
          aria-label="Open AI assistant"
          className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand px-5 py-3.5 font-semibold text-white shadow-[0_12px_30px_-8px_rgba(14,107,76,0.8)] transition hover:bg-brand-dark"
        >
          <FiMessageCircle className="text-xl" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      )}
    </>
  );
};

export default ChatWidget;
