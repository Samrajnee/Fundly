"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { FinancialHealthScoreDTO } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function HealthScorePage() {
  const [score, setScore] = useState<FinancialHealthScoreDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<FinancialHealthScoreDTO>("/health-score").then(setScore).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!score) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  const percent = Math.round((score.totalScore / score.maxScore) * 100);

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Financial health score" />

      <Card style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "2.6rem", fontWeight: 500, margin: 0, color: "var(--color-accent-dark)" }}>
          {score.totalScore} / {score.maxScore}
        </p>
        <p style={{ margin: "0.25rem 0 0" }}>{percent}%</p>
      </Card>

      {score.components.map((c) => (
        <Card key={c.label} style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <strong>{c.label}</strong>
            <span className="num">{c.score}/{c.maxScore}</span>
          </div>
          <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
            <div style={{ width: `${(c.score / c.maxScore) * 100}%`, background: c.score / c.maxScore >= 0.7 ? "var(--color-success)" : c.score / c.maxScore >= 0.4 ? "#c98a2e" : "var(--color-danger)", height: "100%" }} />
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem" }}>{c.message}</p>
        </Card>
      ))}
    </main>
  );
}