"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { DebtDTO, DebtType } from "@fundly/shared-types";

interface DebtFormValues {
  type: DebtType;
  lender: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  emiAmount: number;
  tenureMonths: number;
  startDate: string;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<DebtFormValues>({
    defaultValues: { type: "PERSONAL_LOAN" },
  });

  async function loadData() {
    try {
      const data = await apiGet<DebtDTO[]>("/debts");
      setDebts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load debts");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: DebtFormValues) {
    setError(null);
    try {
      await apiPost("/debts", values);
      reset({ type: "PERSONAL_LOAN" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add debt");
    }
  }

  const totalEmi = debts.reduce((sum, d) => sum + d.emiAmount, 0);
  const totalOutstanding = debts.reduce((sum, d) => sum + d.outstandingAmount, 0);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Debt & EMI Planner</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
        <p>Total Monthly EMI: ₹{totalEmi.toFixed(2)}</p>
        <p>Total Outstanding: ₹{totalOutstanding.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Type
          <select {...register("type")}>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="PERSONAL_LOAN">Personal Loan</option>
            <option value="HOME_LOAN">Home Loan</option>
            <option value="VEHICLE_LOAN">Vehicle Loan</option>
            <option value="EDUCATION_LOAN">Education Loan</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label>
          Lender
          <input type="text" {...register("lender", { required: true })} />
        </label>

        <label>
          Principal Amount (₹)
          <input type="number" step="0.01" {...register("principalAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Outstanding Amount (₹)
          <input type="number" step="0.01" {...register("outstandingAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Interest Rate (% p.a.)
          <input type="number" step="0.01" {...register("interestRate", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          EMI Amount (₹)
          <input type="number" step="0.01" {...register("emiAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Tenure (months)
          <input type="number" {...register("tenureMonths", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Start Date
          <input type="date" {...register("startDate", { required: true })} />
        </label>

        <button type="submit">Add Debt</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Debts</h2>
      {debts.map((d) => (
        <div key={d.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <strong>{d.lender}</strong> — {d.type}
          <div style={{ background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden", margin: "0.5rem 0" }}>
            <div style={{ width: `${d.percentPaidOff}%`, background: "#3a3", height: "100%" }} />
          </div>
          <p>{d.percentPaidOff}% paid off</p>
          <p>Outstanding: ₹{d.outstandingAmount} of ₹{d.principalAmount}</p>
          <p>EMI: ₹{d.emiAmount}/month at {d.interestRate}% interest</p>
        </div>
      ))}
    </main>
  );
}