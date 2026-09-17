"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { WhatIfResultDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function WhatIfPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<WhatIfResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSimulate() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try { setResult(await apiPost<WhatIfResultDTO>("/ai/what-if/simulate", { question })); }
    catch (err) { setError(err instanceof Error ? err.message : "Couldn't run that simulation"); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="What-if simulator" description='Try: "What if my salary increases by Rs 10,000?" or "What if I increase my SIP by Rs 3,000?"' />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a hypothetical" />
        <button onClick={onSimulate} disabled={loading}>{loading ? "Simulating" : "Simulate"}</button>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {result && (
        <div>
          <p style={{ fontStyle: "italic" }}>{result.interpretation}</p>

          <Card style={{ padding: 0, marginTop: "1rem" }}>
            <table>
              <thead><tr><th style={{ padding: "0.75rem 1rem" }}>Category</th><th style={{ textAlign: "right" }}>Current</th><th style={{ textAlign: "right", paddingRight: "1rem" }}>Projected</th></tr></thead>
              <tbody>
                {[
                  ["Necessities", result.current.necessitiesAmount, result.projected.necessitiesAmount],
                  ["Lifestyle", result.current.lifestyleAmount, result.projected.lifestyleAmount],
                  ["Savings", result.current.savingsAmount, result.projected.savingsAmount],
                  ["Investments", result.current.investmentsAmount, result.projected.investmentsAmount],
                  ["Goals", result.current.goalsAmount, result.projected.goalsAmount],
                  ["Buffer", result.current.bufferAmount, result.projected.bufferAmount],
                ].map(([label, cur, proj]) => (
                  <tr key={label as string}>
                    <td style={{ paddingLeft: "1rem" }}>{label}</td>
                    <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(cur as number)}</td>
                    <td className="num" style={{ textAlign: "right", paddingRight: "1rem" }}>Rs {formatCurrency(proj as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <p style={{ marginTop: "1rem" }}>{result.explanation}</p>
        </div>
      )}
    </main>
  );
}