"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { LifestyleInflationDTO } from "@fundly/shared-types";

export default function LifestyleInflationPage() {
  const [data, setData] = useState<LifestyleInflationDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<LifestyleInflationDTO>("/lifestyle-inflation")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Lifestyle Inflation Tracker</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
        <p>Salary growth: {data.salaryGrowthPercent !== null ? `${data.salaryGrowthPercent}%` : "Not enough data yet"}</p>
        <p>Lifestyle spend growth: {data.lifestyleSpendGrowthPercent !== null ? `${data.lifestyleSpendGrowthPercent}%` : "Not enough data yet"}</p>
        <p style={{ fontWeight: "bold", marginTop: "0.5rem" }}>{data.verdict}</p>
      </div>

      <h2>Monthly Lifestyle Spending</h2>
      {data.monthlyLifestyleSpend.length === 0 ? (
        <p>No lifestyle transactions recorded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Month</th>
              <th style={{ textAlign: "right" }}>Spent</th>
            </tr>
          </thead>
          <tbody>
            {data.monthlyLifestyleSpend.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td style={{ textAlign: "right" }}>₹{m.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}