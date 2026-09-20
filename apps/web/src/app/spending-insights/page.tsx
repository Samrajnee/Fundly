"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { SpendingInsightsDTO, SpendingSnapshotDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const CATEGORY_COLORS = ["#1b3a2b", "#a6832f", "#3f6b52", "#7c9b76", "#8a6c26", "#c7d1c1", "#5a4a2c", "#4a6a63"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildColorMap(...lists: { categoryName: string }[][]): Map<string, string> {
  const map = new Map<string, string>();
  let idx = 0;
  for (const list of lists) {
    for (const item of list) {
      if (!map.has(item.categoryName)) {
        map.set(item.categoryName, CATEGORY_COLORS[idx % CATEGORY_COLORS.length]);
        idx++;
      }
    }
  }
  return map;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function SpendingInsightsPage() {
  const [data, setData] = useState<SpendingInsightsDTO | null>(null);
  const [history, setHistory] = useState<SpendingSnapshotDTO[]>([]);
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const [error, setError] = useState<string | null>(null);
  const [snapshotMessage, setSnapshotMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [insights, snapshots] = await Promise.all([
        apiGet<SpendingInsightsDTO>("/spending-insights"),
        apiGet<SpendingSnapshotDTO[]>("/spending-snapshots"),
      ]);
      setData(insights);
      setHistory(snapshots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSaveSnapshot() {
    setSnapshotMessage(null);
    setError(null);
    try {
      await apiPost("/spending-snapshots", {});
      setSnapshotMessage("This month's snapshot has been saved.");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save snapshot");
    }
  }

  if (error && !data) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  const colorMap = buildColorMap(data.topCategories, data.todayCategories);
  const colorFor = (name: string) => colorMap.get(name) ?? CATEGORY_COLORS[0];

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Spending insights" description={`${MONTH_NAMES[data.month - 1]} ${data.year}`} />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setView("daily")}
          style={{
            background: view === "daily" ? "var(--color-primary)" : "transparent",
            color: view === "daily" ? "var(--color-accent-light)" : "var(--color-text-secondary)",
            border: view === "daily" ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
          }}
        >
          Daily insight
        </button>
        <button
          onClick={() => setView("monthly")}
          style={{
            background: view === "monthly" ? "var(--color-primary)" : "transparent",
            color: view === "monthly" ? "var(--color-accent-light)" : "var(--color-text-secondary)",
            border: view === "monthly" ? "1px solid var(--color-primary)" : "1px solid var(--color-border-strong)",
          }}
        >
          Monthly insight
        </button>
      </div>

      {view === "daily" ? (
        <>
          <Card style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Spent today</p>
            <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", margin: 0 }}>Rs {formatCurrency(data.todayTotalSpend)}</p>
          </Card>

          <h2>Today, by category</h2>
          <p style={{ marginTop: "-0.5rem" }}>What you've spent on today, split by category.</p>
          {data.todayCategories.length === 0 ? (
            <Card><p style={{ margin: 0 }}>Nothing logged yet today.</p></Card>
          ) : (
            <Card>
              {data.todayCategories.map((c) => (
                <div key={c.categoryName} style={{ marginBottom: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorFor(c.categoryName), flexShrink: 0 }} />
                      {c.categoryName}
                    </span>
                    <span className="num">Rs {formatCurrency(c.amount)} ({c.percentOfTotal}%)</span>
                  </div>
                  <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${c.percentOfTotal}%`, background: colorFor(c.categoryName), height: "100%" }} />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </>
      ) : (
        <>
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

          {data.topCategories.length > 0 && (
            <Card style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Most spent on this month</p>
              <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorFor(data.topCategories[0].categoryName), flexShrink: 0 }} />
                {data.topCategories[0].categoryName} (Rs {formatCurrency(data.topCategories[0].amount)})
              </p>
            </Card>
          )}

          <h2>This month, by category</h2>
          {data.topCategories.length === 0 ? (
            <Card><p style={{ margin: 0 }}>No transactions recorded this month.</p></Card>
          ) : (
            <Card>
              {data.topCategories.map((c) => (
                <div key={c.categoryName} style={{ marginBottom: "0.9rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: colorFor(c.categoryName), flexShrink: 0 }} />
                      {c.categoryName}
                    </span>
                    <span className="num">Rs {formatCurrency(c.amount)} ({c.percentOfTotal}%)</span>
                  </div>
                  <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${c.percentOfTotal}%`, background: colorFor(c.categoryName), height: "100%" }} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          <h2>Day by day, top category</h2>
          <p style={{ marginTop: "-0.5rem" }}>Whichever category you spent the most on that day, most recent first.</p>
          {data.dailyTopCategories.length === 0 ? (
            <Card><p style={{ margin: 0 }}>No spending logged yet this month.</p></Card>
          ) : (
            <Card style={{ padding: 0 }}>
              {data.dailyTopCategories.map((entry, idx) => (
                <div
                  key={entry.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.7rem 1.1rem",
                    borderBottom: idx < data.dailyTopCategories.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: colorFor(entry.categoryName), flexShrink: 0 }} />
                    {entry.categoryName} ({formatShortDate(entry.date)})
                  </span>
                  <span className="num">Rs {formatCurrency(entry.amount)}</span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <button onClick={onSaveSnapshot}>Save this month's snapshot</button>
        {snapshotMessage && <p style={{ color: "var(--color-success)", marginTop: "0.5rem" }}>{snapshotMessage}</p>}
        {error && <p style={{ color: "var(--color-danger)", marginTop: "0.5rem" }}>{error}</p>}
      </div>

      <h2>Insight history</h2>
      {history.length === 0 ? (
        <Card><p style={{ margin: 0 }}>No saved snapshots yet.</p></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {history.map((s) => {
            const expanded = expandedId === s.id;
            return (
              <Card key={s.id} style={{ cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : s.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong>{MONTH_NAMES[s.month - 1]} {s.year}</strong>
                  <span className="num">Rs {formatCurrency(s.totalSpend)}</span>
                </div>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>Savings rate: {s.savingsRate}%</p>
                {expanded && (
                  <div style={{ marginTop: "0.9rem" }}>
                    {s.categoryBreakdown.map((c, idx) => (
                      <div key={c.categoryName} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length], flexShrink: 0 }} />
                          {c.categoryName}
                        </span>
                        <span className="num">Rs {formatCurrency(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}