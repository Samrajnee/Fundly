"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  amount: string;
  merchant: string | null;
  note: string | null;
  date: string;
  category: Category;
}

interface ExpenseFormValues {
  categoryId: string;
  amount: number;
  merchant?: string;
  note?: string;
  date: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function ExpensesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ExpenseFormValues>({
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  async function loadData() {
    try {
      const [cats, txns] = await Promise.all([
        apiGet<Category[]>("/categories"),
        apiGet<Transaction[]>("/transactions"),
      ]);
      setCategories(cats);
      setTransactions(txns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onParseExpense() {
    if (!nlText.trim()) return;
    setNlLoading(true);
    setNlError(null);
    try {
      const parsed = await apiPost<{
        amount: number;
        merchant: string | null;
        date: string;
        suggestedCategoryName: string;
      }>("/ai/expense/parse", { text: nlText });

      const matchingCategory = categories.find((c) => c.name === parsed.suggestedCategoryName);

      await apiPost("/transactions", {
        categoryId: matchingCategory?.id ?? categories[0]?.id,
        amount: parsed.amount,
        merchant: parsed.merchant ?? undefined,
        date: parsed.date,
      });

      setNlText("");
      loadData();
    } catch (err) {
      setNlError(err instanceof Error ? err.message : "Couldn't parse that expense");
    } finally {
      setNlLoading(false);
    }
  }

  async function onSubmit(values: ExpenseFormValues) {
    setError(null);
    try {
      await apiPost("/transactions", { ...values, amount: Number(values.amount) });
      reset({ date: values.date, categoryId: "", amount: undefined, merchant: "", note: "" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    }
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Expense tracker" description="Record and categorize your spending." />

      <Card style={{ marginBottom: "1.5rem" }}>
        <label>
          Quick add
          <input
            type="text"
            placeholder="Spent Rs 850 on dinner yesterday"
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
          />
        </label>
        <button onClick={onParseExpense} disabled={nlLoading}>
          {nlLoading ? "Parsing" : "Add with AI"}
        </button>
        {nlError && <p style={{ color: "var(--color-danger)", marginTop: "0.5rem" }}>{nlError}</p>}
      </Card>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Category
            <select {...register("categoryId", { required: true })}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Amount (Rs)
            <input type="number" step="0.01" {...register("amount", { required: true, valueAsNumber: true })} />
          </label>
          <label>
            Merchant (optional)
            <input type="text" {...register("merchant")} />
          </label>
          <label>
            Note (optional)
            <input type="text" {...register("note")} />
          </label>
          <label>
            Date
            <input type="date" {...register("date", { required: true })} />
          </label>
          <button type="submit">Add expense</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

      <h2>Recent expenses</h2>
      {transactions.length === 0 ? (
        <EmptyState message="No expenses recorded yet." />
      ) : (
        <Card style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                <th>Category</th>
                <th>Merchant</th>
                <th style={{ textAlign: "right", paddingRight: "1rem" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ paddingLeft: "1rem" }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.category.name}</td>
                  <td>{t.merchant ?? "\u2014"}</td>
                  <td className="num" style={{ textAlign: "right", paddingRight: "1rem" }}>
                    Rs {formatCurrency(Number(t.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}