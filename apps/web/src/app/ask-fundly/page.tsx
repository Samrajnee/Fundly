"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

interface ChatMessage { role: "user" | "assistant"; content: string; }

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
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Ask Fundly" description="Ask about your own finances: can I afford this, why did I overspend, how much should I save for a trip." />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", minHeight: 200 }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "var(--color-accent-light)" : "var(--color-surface)",
              border: m.role === "user" ? "none" : "1px solid var(--color-border)",
              color: m.role === "user" ? "var(--color-accent-dark)" : "var(--color-ink)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              maxWidth: "82%",
            }}
          >
            {m.content}
          </div>
        ))}
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAsk()}
          placeholder="Ask a question about your finances"
        />
        <button onClick={onAsk} disabled={loading}>{loading ? "..." : "Ask"}</button>
      </div>
    </main>
  );
}