"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import type { AiGoalProposalDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function AiGoalPlannerPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [proposal, setProposal] = useState<AiGoalProposalDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onPropose() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try { setProposal(await apiPost<AiGoalProposalDTO>("/ai/goal-planner/propose", { description })); }
    catch (err) { setError(err instanceof Error ? err.message : "Couldn't plan that goal"); }
    finally { setLoading(false); }
  }

  async function onConfirm() {
    if (!proposal) return;
    try {
      await apiPost("/goals", { name: proposal.name, targetAmount: proposal.targetAmount, targetDate: proposal.targetDate });
      router.push("/goals");
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save goal"); }
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="AI goal planner" description='Describe a goal naturally: "I want to buy a Rs 1.5 lakh bike in 12 months."' />

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your goal" />
        <button onClick={onPropose} disabled={loading}>{loading ? "Thinking" : "Plan it"}</button>
      </div>

      {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

      {proposal && (
        <Card style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginTop: 0 }}>{proposal.name}</h3>
          <p className="num" style={{ margin: "0 0 0.3rem" }}>Target: Rs {formatCurrency(proposal.targetAmount)} by {new Date(proposal.targetDate).toLocaleDateString()}</p>
          <p className="num" style={{ margin: "0 0 0.75rem" }}>Save Rs {formatCurrency(proposal.monthlyRequired)}/month</p>
          <p style={{ color: proposal.feasible ? "var(--color-success)" : "var(--color-danger)", margin: "0 0 1rem" }}>{proposal.reasoning}</p>
          <button onClick={onConfirm}>Confirm and create goal</button>
        </Card>
      )}
    </main>
  );
}