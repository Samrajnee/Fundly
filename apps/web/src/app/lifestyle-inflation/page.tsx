"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { LifestyleInflationDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function LifestyleInflationPage() {
  const [data, setData] = useState<LifestyleInflationDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<LifestyleInflationDTO>("/lifestyle-inflation").then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Lifestyle inflation tracker" />

      <Card style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 0.4rem" }}>Salary growth: {data.salaryGrowthPercent !== null ? `${data.salaryGrowthPercent}%` : "Not enough data yet"}</p>
        <p style={{ margin: "0 0 0.75rem" }}>Lifestyle spend growth: {data.lifestyleSpendGrowthPercent !== null ? `${data.lifestyleSpendGrowthPercent}%` : "Not enough data yet"}</p>
        <p style={{ margin: 0, fontWeight: 600 }}>{data.verdict}</p>
      </Card>

      <h2>Monthly lifestyle spending</h2>
      {data.monthlyLifestyleSpend.length === 0 ? (
        <p>No lifestyle transactions recorded yet.</p>
      ) : (
        <Card style={{ padding: 0 }}>
          <table>
            <thead><tr><th style={{ padding: "0.75rem 1rem" }}>Month</th><th style={{ textAlign: "right", paddingRight: "1rem" }}>Spent</th></tr></thead>
            <tbody>
              {data.monthlyLifestyleSpend.map((m) => (
                <tr key={m.month}>
                  <td style={{ paddingLeft: "1rem" }}>{m.month}</td>
                  <td className="num" style={{ textAlign: "right", paddingRight: "1rem" }}>Rs {formatCurrency(m.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}