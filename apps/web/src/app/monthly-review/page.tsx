"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MonthlyReviewDTO, AIMonthlyReviewDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";

export default function MonthlyReviewPage() {
  const [review, setReview] = useState<MonthlyReviewDTO | null>(null);
  const [aiReview, setAiReview] = useState<AIMonthlyReviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<MonthlyReviewDTO>("/monthly-review").then(setReview).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
    apiGet<AIMonthlyReviewDTO>("/ai/monthly-review").then(setAiReview).catch(() => setAiReview(null));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!review) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Monthly review" description={`Savings rate this month: ${review.savingsRateActual}%`} />

      {aiReview && aiReview.source === "AI" && (
        <Callout>
          <p style={{ margin: "0 0 0.5rem" }}>{aiReview.summary}</p>
          {aiReview.highlights.length > 0 && (
            <>
              <strong>Highlights</strong>
              <ul style={{ margin: "0.25rem 0 0.5rem" }}>{aiReview.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </>
          )}
          {aiReview.areasToImprove.length > 0 && (
            <>
              <strong>Could improve</strong>
              <ul style={{ margin: "0.25rem 0 0" }}>{aiReview.areasToImprove.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </>
          )}
        </Callout>
      )}

      <Card style={{ padding: 0 }}>
        <table>
          <thead><tr><th style={{ padding: "0.75rem 1rem" }}>Category</th><th style={{ textAlign: "right" }}>Planned</th><th style={{ textAlign: "right" }}>Actual</th><th style={{ textAlign: "right", paddingRight: "1rem" }}>Variance</th></tr></thead>
          <tbody>
            {review.comparisons.map((c) => (
              <tr key={c.label}>
                <td style={{ paddingLeft: "1rem" }}>{c.label}</td>
                <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(c.planned)}</td>
                <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(c.actual)}</td>
               <td className="num" style={{ textAlign: "right", paddingRight: "1rem", color: c.variance > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
                {c.variance >= 0 ? "+" : "\u2212"}Rs {formatCurrency(Math.abs(c.variance))}
              </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 600 }}>
              <td style={{ paddingLeft: "1rem", borderTop: "2px solid var(--color-border)" }}>Total</td>
              <td className="num" style={{ textAlign: "right", borderTop: "2px solid var(--color-border)" }}>Rs {formatCurrency(review.totalPlanned)}</td>
              <td className="num" style={{ textAlign: "right", borderTop: "2px solid var(--color-border)" }}>Rs {formatCurrency(review.totalActual)}</td>
              <td style={{ borderTop: "2px solid var(--color-border)" }}></td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </main>
  );
}