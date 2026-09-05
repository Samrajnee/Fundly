"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { GoalDTO } from "@fundly/shared-types";

interface GoalFormValues {
  name: string;
  targetAmount: number;
  targetDate: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<Record<string, string>>({});

  const { register, handleSubmit, reset } = useForm<GoalFormValues>();

  async function loadGoals() {
    try {
      const data = await apiGet<GoalDTO[]>("/goals");
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function onSubmit(values: GoalFormValues) {
    setError(null);
    try {
      await apiPost("/goals", values);
      reset();
      loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    }
  }

  async function onContribute(goalId: string) {
    const amount = Number(contributions[goalId]);
    if (!amount || amount <= 0) return;
    try {
      await apiPost(`/goals/${goalId}/contribute`, { amount });
      setContributions((prev) => ({ ...prev, [goalId]: "" }));
      loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contribution");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Financial Goals</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Goal Name (e.g. Bike, Trip to Goa)
          <input type="text" {...register("name", { required: true })} />
        </label>

        <label>
          Target Amount (₹)
          <input type="number" step="0.01" {...register("targetAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Target Date
          <input type="date" {...register("targetDate", { required: true })} />
        </label>

        <button type="submit">Create Goal</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Goals</h2>
      {goals.map((g) => {
        const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
        return (
          <div key={g.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <strong>{g.name}</strong> — {g.status}
            <div style={{ background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden", margin: "0.5rem 0" }}>
              <div style={{ width: `${percent}%`, background: "#3a3", height: "100%" }} />
            </div>
            <p>
              ₹{g.currentAmount} of ₹{g.targetAmount} saved ({percent}%)
            </p>
            <p>Target date: {new Date(g.targetDate).toLocaleDateString()}</p>
            <p>Save ₹{g.monthlyRequired} / month to stay on track</p>

            {g.status === "ACTIVE" && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  placeholder="Amount"
                  value={contributions[g.id] ?? ""}
                  onChange={(e) => setContributions((prev) => ({ ...prev, [g.id]: e.target.value }))}
                />
                <button onClick={() => onContribute(g.id)}>Contribute</button>
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}