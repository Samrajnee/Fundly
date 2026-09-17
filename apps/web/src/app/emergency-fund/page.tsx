"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import type { EmergencyFundDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function EmergencyFundPage() {
  const [fund, setFund] = useState<EmergencyFundDTO | null>(null);
  const [contribution, setContribution] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try { setFund(await apiGet<EmergencyFundDTO>("/emergency-fund")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load emergency fund"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onContribute() {
    const amount = Number(contribution);
    if (!amount || amount <= 0) return;
    try { await apiPatch("/emergency-fund", { contributionAmount: amount }); setContribution(""); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add contribution"); }
  }

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!fund) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Emergency fund planner" />

      <Card>
        <p style={{ margin: "0 0 0.3rem" }}>Target: {fund.targetMonths} months of necessities</p>
        <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", margin: "0 0 0.75rem" }}>Rs {formatCurrency(fund.targetAmount)}</p>

        <div style={{ background: "var(--color-surface-alt)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
          <div style={{ width: `${Math.min(fund.percentComplete, 100)}%`, background: "var(--color-olive)", height: "100%" }} />
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Rs {formatCurrency(fund.currentAmount)} saved ({fund.percentComplete}%, {fund.monthsCovered} months covered)
        </p>
      </Card>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        <input type="number" placeholder="Add contribution (Rs)" value={contribution} onChange={(e) => setContribution(e.target.value)} />
        <button onClick={onContribute}>Add</button>
      </div>
    </main>
  );
}