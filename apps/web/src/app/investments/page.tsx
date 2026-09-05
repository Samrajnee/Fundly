"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { InvestmentDTO, InvestmentType } from "@fundly/shared-types";

interface InvestmentFormValues {
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  startDate: string;
  notes?: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<InvestmentFormValues>({
    defaultValues: { type: "MUTUAL_FUND" },
  });

  async function loadData() {
    try {
      const data = await apiGet<InvestmentDTO[]>("/investments");
      setInvestments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load investments");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: InvestmentFormValues) {
    setError(null);
    try {
      await apiPost("/investments", values);
      reset({ type: "MUTUAL_FUND" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add investment");
    }
  }

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentValue, 0);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Investment Overview</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
        <p>Total Invested: ₹{totalInvested.toFixed(2)}</p>
        <p>Current Value: ₹{totalCurrent.toFixed(2)}</p>
        <p style={{ color: totalCurrent >= totalInvested ? "green" : "red" }}>
          Overall Gain/Loss: ₹{(totalCurrent - totalInvested).toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Type
          <select {...register("type")}>
            <option value="MUTUAL_FUND">Mutual Fund</option>
            <option value="FIXED_DEPOSIT">Fixed Deposit</option>
            <option value="PPF">PPF</option>
            <option value="EPF">EPF</option>
            <option value="NPS">NPS</option>
            <option value="STOCKS">Stocks</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label>
          Name
          <input type="text" {...register("name", { required: true })} />
        </label>

        <label>
          Invested Amount (₹)
          <input type="number" step="0.01" {...register("investedAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Current Value (₹)
          <input type="number" step="0.01" {...register("currentValue", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Start Date
          <input type="date" {...register("startDate", { required: true })} />
        </label>

        <button type="submit">Add Investment</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Investments</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Name</th>
            <th style={{ textAlign: "left" }}>Type</th>
            <th style={{ textAlign: "right" }}>Invested</th>
            <th style={{ textAlign: "right" }}>Current</th>
            <th style={{ textAlign: "right" }}>Gain/Loss</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.type}</td>
              <td style={{ textAlign: "right" }}>₹{inv.investedAmount}</td>
              <td style={{ textAlign: "right" }}>₹{inv.currentValue}</td>
              <td style={{ textAlign: "right", color: inv.gainLoss >= 0 ? "green" : "red" }}>
                ₹{inv.gainLoss} ({inv.gainLossPercent}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}