"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiGet, apiPost } from "@/lib/api";
import type { NetWorthDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function NetWorthPage() {
  const [data, setData] = useState<NetWorthDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try { setData(await apiGet<NetWorthDTO>("/net-worth")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load net worth"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onTakeSnapshot() {
    try { await apiPost("/net-worth/snapshot", {}); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to save snapshot"); }
  }

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Net worth tracker" />

      <Card style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", fontWeight: 500, margin: 0, color: data.netWorth >= 0 ? "var(--color-success)" : "var(--color-danger)" }}>
          Rs {formatCurrency(data.netWorth)}
        </p>
        <p style={{ margin: "0.25rem 0 0" }}>Net worth</p>
      </Card>

      <Card>
        {[["Investments", data.investments], ["Emergency fund", data.emergencyFund], ["Other savings (goals)", data.otherSavings]].map(([l, v]) => (
          <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
            <span>{l}</span><span className="num">Rs {formatCurrency(v as number)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontWeight: 600, borderTop: "1px solid var(--color-border)" }}>
          <span>Total assets</span><span className="num">Rs {formatCurrency(data.totalAssets)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0" }}>
          <span>Total debt</span><span className="num" style={{ color: "var(--color-danger)" }}>-Rs {formatCurrency(data.totalDebt)}</span>
        </div>
      </Card>

      <button onClick={onTakeSnapshot} style={{ marginTop: "1.25rem" }}>Save today's snapshot</button>

      {data.history.length > 0 && (
        <div style={{ marginTop: "2rem", height: 240 }}>
          <h2>History</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip
                formatter={(v) => `Rs ${formatCurrency(Number(v ?? 0))}`}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              />              <Line type="monotone" dataKey="netWorth" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}