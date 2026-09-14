"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MonthlyReviewDTO } from "@fundly/shared-types";
import type { AIMonthlyReviewDTO } from "@fundly/shared-types";

export default function MonthlyReviewPage() {
  const [review, setReview] = useState<MonthlyReviewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiReview, setAiReview] = useState<AIMonthlyReviewDTO | null>(null);

  useEffect(() => {
    apiGet<AIMonthlyReviewDTO>("/ai/monthly-review")
      .then(setAiReview)
      .catch(() => setAiReview(null));
  }, []);

  useEffect(() => {
    apiGet<MonthlyReviewDTO>("/monthly-review")
      .then(setReview)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      );
  }, []);

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  if (!review) {
    return <main style={{ padding: "2rem" }}>Loading...</main>;
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2rem" }}>
      <h1>Monthly Review</h1>

      {aiReview && aiReview.source === "AI" && (
        <div
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p>{aiReview.summary}</p>

          {aiReview.highlights.length > 0 && (
            <>
              <strong>Highlights</strong>
              <ul>
                {aiReview.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </>
          )}

          {aiReview.areasToImprove.length > 0 && (
            <>
              <strong>Could improve</strong>
              <ul>
                {aiReview.areasToImprove.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <p>
        Savings rate this month: {review.savingsRateActual}%
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1.5rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Category</th>
            <th style={{ textAlign: "right" }}>Planned</th>
            <th style={{ textAlign: "right" }}>Actual</th>
            <th style={{ textAlign: "right" }}>Variance</th>
          </tr>
        </thead>

        <tbody>
          {review.comparisons.map((c) => (
            <tr key={c.label}>
              <td>{c.label}</td>
              <td style={{ textAlign: "right" }}>₹{c.planned}</td>
              <td style={{ textAlign: "right" }}>₹{c.actual}</td>
              <td
                style={{
                  textAlign: "right",
                  color: c.variance > 0 ? "#d33" : "#3a3",
                }}
              >
                {c.variance > 0 ? "+" : ""}₹{c.variance} (
                {c.variancePercent}%)
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr
            style={{
              fontWeight: "bold",
              borderTop: "2px solid #ccc",
            }}
          >
            <td>Total</td>
            <td style={{ textAlign: "right" }}>₹{review.totalPlanned}</td>
            <td style={{ textAlign: "right" }}>₹{review.totalActual}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </main>
  );
}