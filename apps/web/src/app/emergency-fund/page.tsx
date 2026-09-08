"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { EmergencyFundDTO } from "@fundly/shared-types";

export default function EmergencyFundPage() {
  const [fund, setFund] = useState<EmergencyFundDTO | null>(null);
  const [contribution, setContribution] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const data = await apiGet<EmergencyFundDTO>("/emergency-fund");
      setFund(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load emergency fund");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onContribute() {
    const amount = Number(contribution);
    if (!amount || amount <= 0) return;
    try {
      await apiPost("/emergency-fund", { contributionAmount: amount });
      setContribution("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contribution");
    }
  }

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!fund) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Emergency Fund Planner</h1>

      <p>Target: {fund.targetMonths} months of necessities = ₹{fund.targetAmount}</p>
      <p>Saved so far: ₹{fund.currentAmount} ({fund.monthsCovered} months covered)</p>

      <div style={{ background: "#eee", height: "10px", borderRadius: "4px", overflow: "hidden", margin: "1rem 0" }}>
        <div style={{ width: `${Math.min(fund.percentComplete, 100)}%`, background: "#3a3", height: "100%" }} />
      </div>
      <p>{fund.percentComplete}% complete</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
        <input
          type="number"
          placeholder="Add contribution (₹)"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
        />
        <button onClick={onContribute}>Add</button>
      </div>
    </main>
  );
}