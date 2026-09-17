"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiGet } from "@/lib/api";
import type { SpendingInsightsDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function SpendingInsightsPage() {
  const [data, setData] = useState<SpendingInsightsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SpendingInsightsDTO>("/spending-insights").then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Spending insights" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>This month's spend</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", margin: 0 }}>Rs {formatCurrency(data.currentMonthTotalSpend)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Savings rate</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", margin: 0, color: "var(--color-olive-dark)" }}>{data.currentMonthSavingsRate}%</p>
        </Card>
      </div>

      <h2>Top categories</h2>
      {data.topCategories.length === 0 ? (
        <p>No transactions recorded this month.</p>
      ) : (
        <Card>
          {data.topCategories.map((c) => (
            <div key={c.categoryName} style={{ marginBottom: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>{c.categoryName}</span>
                <span className="num">Rs {formatCurrency(c.amount)} ({c.percentOfTotal}%)</span>
              </div>
              <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${c.percentOfTotal}%`, background: "var(--color-clay)", height: "100%" }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <h2>Monthly trend</h2>
      {data.monthlyTrend.length === 0 ? (
        <p>Not enough history yet.</p>
      ) : (
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip
                formatter={(v) => `Rs ${formatCurrency(Number(v ?? 0))}`}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
/>              <Bar dataKey="amount" fill="var(--color-clay)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}