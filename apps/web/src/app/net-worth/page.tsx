"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { NetWorthDTO } from "@fundly/shared-types";

export default function NetWorthPage() {
  const [data, setData] = useState<NetWorthDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const result = await apiGet<NetWorthDTO>("/net-worth");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load net worth");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onTakeSnapshot() {
    try {
      await apiPost("/net-worth/snapshot", {});
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save snapshot");
    }
  }

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Net Worth Tracker</h1>

      <div style={{ textAlign: "center", margin: "2rem 0" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: data.netWorth >= 0 ? "#3a3" : "#d33" }}>
          ₹{data.netWorth}
        </div>
        <p>Net Worth</p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td>Investments</td><td style={{ textAlign: "right" }}>₹{data.investments}</td></tr>
          <tr><td>Emergency Fund</td><td style={{ textAlign: "right" }}>₹{data.emergencyFund}</td></tr>
          <tr><td>Other Savings (Goals)</td><td style={{ textAlign: "right" }}>₹{data.otherSavings}</td></tr>
          <tr style={{ fontWeight: "bold" }}><td>Total Assets</td><td style={{ textAlign: "right" }}>₹{data.totalAssets}</td></tr>
          <tr><td>Total Debt</td><td style={{ textAlign: "right", color: "#d33" }}>−₹{data.totalDebt}</td></tr>
        </tbody>
      </table>

      <button onClick={onTakeSnapshot} style={{ marginTop: "1.5rem" }}>
        Save Today's Snapshot
      </button>

      {data.history.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>History</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><th style={{ textAlign: "left" }}>Date</th><th style={{ textAlign: "right" }}>Net Worth</th></tr>
            </thead>
            <tbody>
              {data.history.map((h) => (
                <tr key={h.date}>
                  <td>{h.date}</td>
                  <td style={{ textAlign: "right" }}>₹{h.netWorth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}