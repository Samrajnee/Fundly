"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { SalaryHistoryEntryDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const LIVING_SITUATION_LABELS: Record<string, string> = {
  WITH_PARENTS: "With parents",
  RENTING_ALONE: "Renting alone",
  RENTING_SHARED: "Renting shared",
  OWN_HOME: "Own home",
};

export default function SalaryHistoryPage() {
  const [history, setHistory] = useState<SalaryHistoryEntryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SalaryHistoryEntryDTO[]>("/salary-history").then(setHistory).catch((err) => setError(err instanceof Error ? err.message : "Failed to load salary history"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Salary history" description="Every salary plan you've created, most recent first." />

      {history.length === 0 ? (
        <EmptyState message="No salary plans yet." actionLabel="Create one" actionHref="/salary-planner" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((entry) => (
            <Card key={entry.id} style={entry.isActive ? { borderColor: "var(--color-olive)" } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem" }}>
                  Rs {formatCurrency(entry.monthlySalary)}
                </span>
                {entry.isActive && <span style={{ fontSize: "0.78rem", color: "var(--color-olive-dark)" }}>Active</span>}
              </div>

              <p style={{ fontSize: "0.85rem", margin: "0.25rem 0 0.75rem" }}>
                {new Date(entry.effectiveFrom).toLocaleDateString()} \u00b7 {LIVING_SITUATION_LABELS[entry.livingSituation]}
                {entry.supportsFamily ? " \u00b7 Supports family" : ""}
              </p>

              {entry.changeFromPrevious && (
                <p style={{ margin: "0 0 0.75rem", color: entry.changeFromPrevious.salaryDelta >= 0 ? "var(--color-olive-dark)" : "var(--color-danger)" }}>
                  {entry.changeFromPrevious.salaryDelta >= 0 ? "+" : ""}Rs {formatCurrency(entry.changeFromPrevious.salaryDelta)} ({entry.changeFromPrevious.salaryDeltaPercent >= 0 ? "+" : ""}{entry.changeFromPrevious.salaryDeltaPercent}%) from previous plan
                </p>
              )}

              <table>
                <tbody>
                  {[["Necessities", entry.necessitiesAmount], ["Lifestyle", entry.lifestyleAmount], ["Savings", entry.savingsAmount], ["Investments", entry.investmentsAmount], ["Goals", entry.goalsAmount], ["Buffer", entry.bufferAmount]].map(([l, v]) => (
                    <tr key={l as string}>
                      <td style={{ border: "none", padding: "0.2rem 0" }}>{l}</td>
                      <td className="num" style={{ border: "none", padding: "0.2rem 0", textAlign: "right" }}>Rs {formatCurrency(v as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/salary-planner">Create a new salary plan</Link>
      </p>
    </main>
  );
}