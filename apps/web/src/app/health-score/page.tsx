"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { FinancialHealthScoreDTO } from "@fundly/shared-types";

export default function HealthScorePage() {
  const [score, setScore] = useState<FinancialHealthScoreDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<FinancialHealthScoreDTO>("/health-score")
      .then(setScore)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load score"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!score) return <main style={{ padding: "2rem" }}>Loading...</main>;

  const percent = Math.round((score.totalScore / score.maxScore) * 100);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Financial Health Score</h1>

      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <div style={{ fontSize: "3rem", fontWeight: "bold" }}>
          {score.totalScore} / {score.maxScore}
        </div>
        <p>{percent}%</p>
      </div>

      {score.components.map((c) => (
        <div key={c.label} style={{ marginBottom: "1.25rem" }}>
          <strong>{c.label}</strong> — {c.score}/{c.maxScore}
          <div style={{ background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden", margin: "0.5rem 0" }}>
            <div
              style={{
                width: `${(c.score / c.maxScore) * 100}%`,
                background: c.score / c.maxScore >= 0.7 ? "#3a3" : c.score / c.maxScore >= 0.4 ? "#e90" : "#d33",
                height: "100%",
              }}
            />
          </div>
          <small>{c.message}</small>
        </div>
      ))}
    </main>
  );
}