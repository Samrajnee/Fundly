"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { SalaryHistoryEntryDTO } from "@fundly/shared-types";

const LIVING_SITUATION_LABELS: Record<string, string> = {
  WITH_PARENTS: "With Parents",
  RENTING_ALONE: "Renting Alone",
  RENTING_SHARED: "Renting Shared",
  OWN_HOME: "Own Home",
};

export default function SalaryHistoryPage() {
  const [history, setHistory] = useState<SalaryHistoryEntryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<SalaryHistoryEntryDTO[]>("/salary-history")
      .then(setHistory)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load salary history"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1>Salary History</h1>
      <p>Every salary plan you've created, most recent first.</p>

      {history.length === 0 ? (
        <p>
          No salary plans yet. <Link href="/salary-planner">Create one →</Link>
        </p>
      ) : (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((entry) => (
            <div
              key={entry.id}
              style={{
                border: entry.isActive ? "2px solid #3a3" : "1px solid #ccc",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: "1.2rem" }}>₹{entry.monthlySalary}</strong>
                {entry.isActive && <span style={{ color: "#3a3", fontSize: "0.85rem" }}>Active</span>}
              </div>

              <small style={{ color: "#666" }}>
                {new Date(entry.effectiveFrom).toLocaleDateString()} · {LIVING_SITUATION_LABELS[entry.livingSituation]}
                {entry.supportsFamily ? " · Supports family" : ""}
              </small>

              {entry.changeFromPrevious && (
                <p style={{ margin: "0.5rem 0", color: entry.changeFromPrevious.salaryDelta >= 0 ? "#3a3" : "#d33" }}>
                  {entry.changeFromPrevious.salaryDelta >= 0 ? "+" : ""}₹{entry.changeFromPrevious.salaryDelta} (
                  {entry.changeFromPrevious.salaryDeltaPercent >= 0 ? "+" : ""}
                  {entry.changeFromPrevious.salaryDeltaPercent}%) from previous plan
                </p>
              )}

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                <tbody>
                  <tr><td>Necessities</td><td style={{ textAlign: "right" }}>₹{entry.necessitiesAmount}</td></tr>
                  <tr><td>Lifestyle</td><td style={{ textAlign: "right" }}>₹{entry.lifestyleAmount}</td></tr>
                  <tr><td>Savings</td><td style={{ textAlign: "right" }}>₹{entry.savingsAmount}</td></tr>
                  <tr><td>Investments</td><td style={{ textAlign: "right" }}>₹{entry.investmentsAmount}</td></tr>
                  <tr><td>Goals</td><td style={{ textAlign: "right" }}>₹{entry.goalsAmount}</td></tr>
                  <tr><td>Buffer</td><td style={{ textAlign: "right" }}>₹{entry.bufferAmount}</td></tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Link href="/salary-planner">+ Create a new salary plan →</Link>
      </div>
    </main>
  );
}