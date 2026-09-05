"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { RecurringExpenseDTO } from "@fundly/shared-types";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface RecurringFormValues {
  categoryId: string;
  label: string;
  amount: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  dueDay?: number;
}

export default function RecurringPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpenseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<RecurringFormValues>({
    defaultValues: { frequency: "MONTHLY" },
  });

  async function loadData() {
    try {
      const [cats, items] = await Promise.all([
        apiGet<Category[]>("/categories"),
        apiGet<RecurringExpenseDTO[]>("/recurring"),
      ]);
      setCategories(cats);
      setRecurring(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: RecurringFormValues) {
    setError(null);
    try {
      await apiPost("/recurring", values);
      reset({ frequency: "MONTHLY" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add recurring expense");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Recurring Expenses</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Category
          <select {...register("categoryId", { required: true })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Label (e.g. Rent, Netflix, Car EMI)
          <input type="text" {...register("label", { required: true })} />
        </label>

        <label>
          Amount (₹)
          <input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Frequency
          <select {...register("frequency")}>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </label>

        <label>
          Due Day of Month (optional)
          <input type="number" min={1} max={31} {...register("dueDay", { valueAsNumber: true })} />
        </label>

        <button type="submit">Add Recurring Expense</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Active Recurring Expenses</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Label</th>
            <th style={{ textAlign: "left" }}>Frequency</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {recurring.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td>{r.frequency}</td>
              <td style={{ textAlign: "right" }}>₹{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}