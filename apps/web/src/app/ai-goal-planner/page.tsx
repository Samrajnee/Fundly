"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import type { AiGoalProposalDTO } from "@fundly/shared-types";

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
    try {
      const result = await apiPost<AiGoalProposalDTO>("/ai/goal-planner/propose", { description });
      setProposal(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't plan that goal");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm() {
    if (!proposal) return;
    try {
      await apiPost("/goals", {
        name: proposal.name,
        targetAmount: proposal.targetAmount,
        targetDate: proposal.targetDate,
      });
      router.push("/goals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>AI Goal Planner</h1>
      <p>Describe a goal naturally — e.g. "I want to buy a ₹1.5 lakh bike in 12 months."</p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ flex: 1 }}
          placeholder="Describe your goal..."
        />
        <button onClick={onPropose} disabled={loading}>
          {loading ? "Thinking..." : "Plan It"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {proposal && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1.5rem" }}>
          <h2>{proposal.name}</h2>
          <p>Target: ₹{proposal.targetAmount} by {new Date(proposal.targetDate).toLocaleDateString()}</p>
          <p>You'll need to save ₹{proposal.monthlyRequired}/month.</p>
          <p style={{ color: proposal.feasible ? "#3a3" : "#d33" }}>{proposal.reasoning}</p>
          <button onClick={onConfirm} style={{ marginTop: "0.5rem" }}>
            Confirm & Create Goal
          </button>
        </div>
      )}
    </main>
  );
}