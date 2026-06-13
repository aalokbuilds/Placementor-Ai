import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { sendChatMessage } from "../utils/api";

const STARTERS = [
  "How do I improve my resume?",
  "What skills should I learn for a Data Science role?",
  "How should I prepare for a technical interview?",
  "Can you suggest some good portfolio projects?",
  "How do I negotiate a job offer?",
];

export default function ChatPage() {
  const { resumeData, targetRole } = useApp();
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Placementor AI, your personal career mentor. Ask me anything about your career, resume, interview prep, or skill development." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const context = [
    targetRole && `Target role: ${targetRole}`,
    resumeData?.summary && `Resume summary: ${resumeData.summary}`,
    resumeData?.technical_skills?.length && `Technical skills: ${resumeData.technical_skills.slice(0, 8).join(", ")}`,
  ].filter(Boolean).join(". ");

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const { data } = await sendChatMessage(msg, context);
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 fade-in">
      <div className="flex items-center gap-2 mb-5">
        <Bot size={22} style={{ color: "var(--brand)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>AI Career Mentor</h1>
      </div>

      {/* Chat window */}
      <div className="card flex flex-col" style={{ height: "520px" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 fade-in ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: m.role === "bot" ? "var(--brand)" : "var(--bg-tertiary)" }}
              >
                {m.role === "bot"
                  ? <Bot size={15} color="white" />
                  : <User size={15} style={{ color: "var(--text-secondary)" }} />}
              </div>
              <div
                className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: m.role === "bot" ? "var(--bg-tertiary)" : "var(--brand)",
                  color: m.role === "bot" ? "var(--text-primary)" : "white",
                  borderRadius: m.role === "bot" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "var(--brand)" }}>
                <Bot size={15} color="white" />
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--bg-tertiary)" }}>
                <RefreshCw size={14} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask anything about your career…"
            style={{ borderRadius: "20px" }}
          />
          <button
            className="btn-primary flex-shrink-0 px-3"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{ borderRadius: "20px" }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
