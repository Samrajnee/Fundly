"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { RecurringExpenseDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface Category { id: string; name: string; }
interface RecurringFormValues { categoryId: string; label: string; amount: number; frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"; dueDay?: number; }

export default function RecurringPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpenseDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<RecurringFormValues>({ defaultValues: { frequency: "MONTHLY" } });

  async function loadData() {
    try {
      const [cats, items] = await Promise.all([apiGet<Category[]>("/categories"), apiGet<RecurringExpenseDTO[]>("/recurring")]);
      setCategories(cats); setRecurring(items);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(values: RecurringFormValues) {
    setError(null);
    try { await apiPost("/recurring", values); reset({ frequency: "MONTHLY" }); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add recurring expense"); }
  }

  async function onPostDueNow() {
    try {
      const result = await apiPost<{ postedCount: number }>("/recurring/post-due", {});
      alert(`Posted ${result.postedCount} due expense(s).`);
      loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to post due expenses"); }
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Recurring expenses" description="Rent, subscriptions, EMIs, and bills that repeat." />

      <button onClick={onPostDueNow} style={{ marginBottom: "1.25rem", background: "transparent", color: "var(--color-clay-dark)", border: "1px solid var(--color-clay)" }}>
        Post due expenses now
      </button>

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Category
            <select {...register("categoryId", { required: true })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Label<input type="text" placeholder="Rent, Netflix, car EMI" {...register("label", { required: true })} /></label>
          <label>Amount (Rs)<input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} /></label>
          <label>Frequency
            <select {...register("frequency")}>
              <option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option><option value="YEARLY">Yearly</option>
            </select>
          </label>
          <label>Due day of month (optional)<input type="number" min={1} max={31} {...register("dueDay", { valueAsNumber: true })} /></label>
          <button type="submit">Add recurring expense</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      <h2>Active recurring expenses</h2>
      {recurring.length === 0 ? (
        <EmptyState message="No recurring expenses yet." />
      ) : (
        <Card style={{ padding: 0 }}>
          <table>
            <thead><tr><th style={{ padding: "0.75rem 1rem" }}>Label</th><th>Frequency</th><th style={{ textAlign: "right" }}>Amount</th><th style={{ textAlign: "right", paddingRight: "1rem" }}>Last posted</th></tr></thead>
            <tbody>
              {recurring.map((r) => (
                <tr key={r.id}>
                  <td style={{ paddingLeft: "1rem" }}>{r.label}</td>
                  <td>{r.frequency}</td>
                  <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(r.amount)}</td>
                  <td style={{ textAlign: "right", paddingRight: "1rem" }}>{r.lastPostedDate ? new Date(r.lastPostedDate).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}