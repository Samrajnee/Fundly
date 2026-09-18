"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { GoalDTO } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface GoalFormValues {
  name: string;
  targetAmount: number;
  targetDate: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
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

  async function onDelete(goalId: string) {
    if (!confirm("Delete this goal?")) return;
    try {
      await apiDelete(`/goals/${goalId}`);
      loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Financial goals" description="Anything you're saving toward on purpose." />
      <p style={{ marginTop: "-1.2rem", marginBottom: "1.75rem" }}>
        <Link href="/ai-goal-planner">Describe a goal in plain language instead</Link>
      </p>

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Goal name
            <input type="text" placeholder="Bike, trip to Goa" {...register("name", { required: true })} />
          </label>
          <label>
            Target amount (Rs)
            <input type="number" step="0.01" {...register("targetAmount", { required: true, valueAsNumber: true })} />
          </label>
          <label>
            Target date
            <input type="date" {...register("targetDate", { required: true })} />
          </label>
          <button type="submit">Create goal</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      {goals.length === 0 ? (
        <EmptyState message="No goals yet." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {goals.map((g) => {
            const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
            return (
              <Card key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h3 style={{ margin: 0 }}>{g.name}</h3>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: g.status === "COMPLETED" ? "var(--color-success)" : "var(--color-text-muted)",
                    }}
                  >
                    {g.status === "COMPLETED" ? "Completed" : "In progress"}
                  </span>
                </div>

                <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden", margin: "0.75rem 0" }}>
                  <div style={{ width: `${percent}%`, background: "var(--color-success)", height: "100%" }} />
                </div>

                <p className="num" style={{ margin: "0 0 0.25rem" }}>
                  Rs {formatCurrency(g.currentAmount)} of Rs {formatCurrency(g.targetAmount)} ({percent}%)
                </p>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.85rem" }}>
                  Target: {new Date(g.targetDate).toLocaleDateString()}
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  Save Rs {formatCurrency(g.monthlyRequired)}/month to stay on track
                </p>

                {g.status === "ACTIVE" && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={contributions[g.id] ?? ""}
                      onChange={(e) => setContributions((prev) => ({ ...prev, [g.id]: e.target.value }))}
                    />
                    <button onClick={() => onContribute(g.id)}>Contribute</button>
                  </div>
                )}

                <button onClick={() => onDelete(g.id)} className="danger-chip" style={{ marginTop: "0.75rem" }}>
                  Delete goal
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}