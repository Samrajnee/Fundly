"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { BudgetProgressDTO, SafeToSpendDTO } from "@fundly/shared-types";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface BudgetFormValues {
  categoryId: string;
  monthlyLimit: number;
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<BudgetProgressDTO[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<BudgetFormValues>();

  async function loadData() {
    try {
      const [cats, budgetProgress] = await Promise.all([
        apiGet<Category[]>("/categories"),
        apiGet<BudgetProgressDTO[]>("/budgets"),
      ]);
      setCategories(cats);
      setProgress(budgetProgress);

      try {
        const sts = await apiGet<SafeToSpendDTO>("/safe-to-spend");
        setSafeToSpend(sts);
      } catch {
        setSafeToSpend(null); // no active salary plan yet — fine, just skip this section
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: BudgetFormValues) {
    setError(null);
    try {
      await apiPost("/budgets", { ...values, monthlyLimit: Number(values.monthlyLimit) });
      reset();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set budget");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Budget Planner</h1>

      {safeToSpend && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
          <h2>Safe to Spend</h2>
          <p>Today: ₹{safeToSpend.dailySafeAmount}</p>
          <p>This week: ₹{safeToSpend.weeklySafeAmount}</p>
          <p>Lifestyle budget remaining this month: ₹{safeToSpend.lifestyleBudgetRemaining}</p>
          <p>{safeToSpend.daysLeftInMonth} days left in the month</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Category
          <select {...register("categoryId", { required: true })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </label>

        <label>
          Monthly Limit (₹)
          <input type="number" step="0.01" {...register("monthlyLimit", { required: true, valueAsNumber: true })} />
        </label>

        <button type="submit">Set Budget</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Budget Progress</h2>
      {progress.map((p) => (
        <div key={p.categoryId} style={{ marginBottom: "1rem" }}>
          <strong>{p.categoryName}</strong>
          <div style={{ background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(p.percentUsed, 100)}%`,
                background: p.percentUsed > 100 ? "#d33" : "#3a3",
                height: "100%",
              }}
            />
          </div>
          <small>
            ₹{p.spent} of ₹{p.monthlyLimit} spent ({p.percentUsed}%) — ₹{p.remaining} remaining
          </small>
        </div>
      ))}
    </main>
  );
}