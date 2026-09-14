"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AskFundlyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAsk() {
    if (!question.trim()) return;
    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const result = await apiPost<{ answer: string }>("/ai/assistant/ask", { question: userMessage.content });
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Ask Fundly</h1>
      <p>Ask about your own finances - "Can I afford this?", "Why did I overspend?", "How much should I save for my trip?"</p>

      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#e6f0ff" : "#f5f5f5",
              padding: "0.75rem",
              borderRadius: "6px",
              maxWidth: "85%",
            }}
          >
            {m.content}
          </div>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAsk()}
          placeholder="Ask a question about your finances..."
          style={{ flex: 1 }}
        />
        <button onClick={onAsk} disabled={loading}>
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </main>
  );
}