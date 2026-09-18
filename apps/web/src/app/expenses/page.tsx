"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

interface Category { id: string; name: string; }
interface Transaction {
  id: string;
  amount: string;
  merchant: string | null;
  note: string | null;
  date: string;
  category: Category;
}
interface ExpenseFormValues { categoryId: string; amount: number; merchant?: string; note?: string; date: string; }

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");

  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ExpenseFormValues>({
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  async function loadData() {
    try {
      const [cats, txns] = await Promise.all([apiGet<Category[]>("/categories"), apiGet<Transaction[]>("/transactions")]);
      setCategories(cats);
      setTransactions(txns);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load data"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onParseExpense() {
    if (!nlText.trim()) return;
    setNlLoading(true);
    setNlError(null);
    try {
      const parsed = await apiPost<{
        amount: number; merchant: string | null; date: string;
        resolvedCategoryId: string; resolvedCategoryName: string; usedFallbackCategory: boolean;
      }>("/ai/expense/parse", { text: nlText });

      await apiPost("/transactions", {
        categoryId: parsed.resolvedCategoryId,
        amount: parsed.amount,
        merchant: parsed.merchant ?? undefined,
        note: nlText,
        date: parsed.date,
      });

      setNlText("");
      loadData();
    } catch (err) { setNlError(err instanceof Error ? err.message : "Couldn't parse that expense"); }
    finally { setNlLoading(false); }
  }

  async function onSubmit(values: ExpenseFormValues) {
    setError(null);
    try {
      await apiPost("/transactions", { ...values, amount: Number(values.amount) });
      reset({ date: values.date, categoryId: "", amount: undefined, merchant: "", note: "" });
      loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add expense"); }
  }

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditAmount(t.amount);
    setEditNote(t.note ?? "");
  }

  async function saveEdit(id: string) {
    try {
      await apiPatch(`/transactions/${id}`, { amount: Number(editAmount), note: editNote });
      setEditingId(null);
      loadData();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update expense"); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    try { await apiDelete(`/transactions/${id}`); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete expense"); }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Expense tracker" description="Record and categorize your spending." />

      <Card style={{ marginBottom: "1.5rem" }}>
        <label>
          Quick add
          <input type="text" placeholder="Spent Rs 850 on dinner yesterday" value={nlText} onChange={(e) => setNlText(e.target.value)} />
        </label>
        <button onClick={onParseExpense} disabled={nlLoading}>{nlLoading ? "Parsing" : "Add with AI"}</button>
        {nlError && <p style={{ color: "var(--color-danger)", marginTop: "0.5rem" }}>{nlError}</p>}
      </Card>

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Category
            <select {...register("categoryId", { required: true })}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Amount (Rs)<input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} /></label>
          <label>Merchant (optional)<input type="text" {...register("merchant")} /></label>
          <label>Note (optional)<input type="text" {...register("note")} /></label>
          <label>Date<input type="date" {...register("date", { required: true })} /></label>
          <button type="submit">Add expense</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      <h2>Recent expenses</h2>
      {transactions.length === 0 ? (
        <Card><p style={{ margin: 0 }}>No expenses recorded yet.</p></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {transactions.map((t) => (
            <Card key={t.id} style={{ padding: "1rem 1.25rem" }}>
              {editingId === t.id ? (
                <div>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ marginBottom: "0.3rem" }}>Amount
                        <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                      </label>
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ marginBottom: "0.3rem" }}>Note
                        <input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => saveEdit(t.id)}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <div style={{ minWidth: 90 }}>{new Date(t.date).toLocaleDateString()}</div>
                  <div style={{ flex: 1 }}>
                    <div>{t.category.name}{t.merchant ? ` \u00b7 ${t.merchant}` : ""}</div>
                    {t.note && <small style={{ color: "var(--color-text-muted)" }}>{t.note}</small>}
                  </div>
                  <div className="num" style={{ fontWeight: 600, minWidth: 90, textAlign: "right" }}>Rs {formatCurrency(Number(t.amount))}</div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => startEdit(t)} style={{ background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-strong)", padding: "0.4rem 0.7rem", fontSize: "0.8rem" }}>Edit</button>
                    <button onClick={() => onDelete(t.id)} className="danger-chip">Delete</button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}