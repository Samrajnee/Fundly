"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { SpendingInsightsDTO } from "@fundly/shared-types";

export default function SpendingInsightsPage() {
  const [data, setData] = useState<SpendingInsightsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SpendingInsightsDTO>("/spending-insights")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Spending Insights</h1>

      <p>This month's total spend: ₹{data.currentMonthTotalSpend}</p>
      <p>Savings rate this month: {data.currentMonthSavingsRate}%</p>

      <h2 style={{ marginTop: "1.5rem" }}>Top Categories</h2>
      {data.topCategories.length === 0 ? (
        <p>No transactions recorded this month.</p>
      ) : (
        data.topCategories.map((c) => (
          <div key={c.categoryName} style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{c.categoryName}</span>
              <span>₹{c.amount} ({c.percentOfTotal}%)</span>
            </div>
            <div style={{ background: "#eee", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${c.percentOfTotal}%`, background: "#666", height: "100%" }} />
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: "1.5rem" }}>Monthly Trend</h2>
      {data.monthlyTrend.length === 0 ? (
        <p>Not enough history yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Month</th>
              <th style={{ textAlign: "right" }}>Spent</th>
              <th style={{ textAlign: "right" }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.monthlyTrend.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td style={{ textAlign: "right" }}>₹{m.amount}</td>
                <td style={{ textAlign: "right", color: (m.changePercent ?? 0) > 0 ? "#d33" : "#3a3" }}>
                  {m.changePercent !== null ? `${m.changePercent > 0 ? "+" : ""}${m.changePercent}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}