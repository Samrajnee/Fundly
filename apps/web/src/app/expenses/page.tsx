"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";

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
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
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
        confidence: string;
      }>("/ai/expense/parse", { text: nlText });

      const matchingCategory = categories.find(
        (c) => c.name === parsed.suggestedCategoryName
      );

      await apiPost("/transactions", {
        categoryId: matchingCategory?.id ?? categories[0]?.id,
        amount: parsed.amount,
        merchant: parsed.merchant ?? undefined,
        date: parsed.date,
      });

      setNlText("");
      loadData();
    } catch (err) {
      setNlError(
        err instanceof Error
          ? err.message
          : "Couldn't parse that expense"
      );
    } finally {
      setNlLoading(false);
    }
  }

  async function onSubmit(values: ExpenseFormValues) {
    setError(null);

    try {
      await apiPost("/transactions", {
        ...values,
        amount: Number(values.amount),
      });

      reset({
        date: values.date,
        categoryId: "",
        amount: undefined,
        merchant: "",
        note: "",
      });

      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add expense"
      );
    }
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Expense Tracker</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <label>
          Quick add (describe it naturally)
          <input
            type="text"
            placeholder='e.g. "Spent ₹850 on dinner yesterday"'
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <button
          onClick={onParseExpense}
          disabled={nlLoading}
          style={{ marginTop: "0.5rem" }}
        >
          {nlLoading ? "Parsing..." : "Add with AI"}
        </button>

        {nlError && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>
            {nlError}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
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
          Amount (₹)
          <input
            type="number"
            step="0.01"
            {...register("amount", {
              required: true,
              valueAsNumber: true,
            })}
          />
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
          <input
            type="date"
            {...register("date", { required: true })}
          />
        </label>

        <button type="submit">Add Expense</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Recent Expenses</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Date</th>
            <th style={{ textAlign: "left" }}>Category</th>
            <th style={{ textAlign: "left" }}>Merchant</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.category.name}</td>
              <td>{t.merchant ?? "-"}</td>
              <td style={{ textAlign: "right" }}>₹{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}