"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { WhatIfResultDTO } from "@fundly/shared-types";

export default function WhatIfPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<WhatIfResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSimulate() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<WhatIfResultDTO>("/ai/what-if/simulate", { question });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't run that simulation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2rem" }}>
      <h1>What-If Simulator</h1>
      <p>Try: "What if my salary increases by ₹10,000?" or "What if I move to Bangalore and pay ₹20,000 rent?"</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Ask a hypothetical..."
        />
        <button onClick={onSimulate} disabled={loading}>
          {loading ? "Simulating..." : "Simulate"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontStyle: "italic" }}>{result.interpretation}</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "right" }}>Current</th>
                <th style={{ textAlign: "right" }}>Projected</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Necessities</td><td style={{ textAlign: "right" }}>₹{result.current.necessitiesAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.necessitiesAmount}</td></tr>
              <tr><td>Lifestyle</td><td style={{ textAlign: "right" }}>₹{result.current.lifestyleAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.lifestyleAmount}</td></tr>
              <tr><td>Savings</td><td style={{ textAlign: "right" }}>₹{result.current.savingsAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.savingsAmount}</td></tr>
              <tr><td>Investments</td><td style={{ textAlign: "right" }}>₹{result.current.investmentsAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.investmentsAmount}</td></tr>
              <tr><td>Goals</td><td style={{ textAlign: "right" }}>₹{result.current.goalsAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.goalsAmount}</td></tr>
              <tr><td>Buffer</td><td style={{ textAlign: "right" }}>₹{result.current.bufferAmount}</td><td style={{ textAlign: "right" }}>₹{result.projected.bufferAmount}</td></tr>
            </tbody>
          </table>

          <p style={{ marginTop: "1rem" }}>{result.explanation}</p>
        </div>
      )}
    </main>
  );
}