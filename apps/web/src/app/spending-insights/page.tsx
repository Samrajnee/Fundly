"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiGet } from "@/lib/api";
import type { SpendingInsightsDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const CATEGORY_COLORS = ["#1b3a2b", "#a6832f", "#3f6b52", "#7c9b76", "#8a6c26", "#c7d1c1", "#5a4a2c"];

export default function SpendingInsightsPage() {
  const [data, setData] = useState<SpendingInsightsDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SpendingInsightsDTO>("/spending-insights").then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Spending insights" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>This month's spend</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", margin: 0 }}>Rs {formatCurrency(data.currentMonthTotalSpend)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Savings rate</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", margin: 0, color: "var(--color-success)" }}>{data.currentMonthSavingsRate}%</p>
        </Card>
      </div>

      <h2>This month, by category</h2>
      <p style={{ marginTop: "-0.5rem" }}>Where your money actually went this month, biggest first.</p>
      {data.topCategories.length === 0 ? (
        <Card><p style={{ margin: 0 }}>No transactions recorded this month.</p></Card>
      ) : (
        <Card>
          {data.topCategories.map((c, idx) => (
            <div key={c.categoryName} style={{ marginBottom: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length], flexShrink: 0 }} />
                  {c.categoryName}
                </span>
                <span className="num">Rs {formatCurrency(c.amount)} ({c.percentOfTotal}%)</span>
              </div>
              <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${c.percentOfTotal}%`, background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length], height: "100%" }} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <h2>Spending over time, by category</h2>
      <p style={{ marginTop: "-0.5rem" }}>Each bar is one month, split by category, so you can see how your spending mix shifts.</p>
      {data.monthlyTrend.length === 0 ? (
        <Card><p style={{ margin: 0 }}>Not enough history yet. Once you've logged expenses across more than one month, this chart fills in.</p></Card>
      ) : data.monthlyTrend.length === 1 ? (
        <Card><p style={{ margin: 0 }}>Only one month of data so far ({data.monthlyTrend[0].month}). This chart becomes a useful comparison once a second month has spending logged.</p></Card>
      ) : (
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrend} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip
                formatter={(value) => `Rs ${formatCurrency(Number(value ?? 0))}`}
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}
              />
              <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
              {data.trendCategories.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} stackId="spend" fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} radius={idx === data.trendCategories.length - 1 ? [4, 4, 0, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}