"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import type { SalaryIncrementComparisonDTO } from "@fundly/shared-types";

interface FormValues {
  newMonthlySalary: number;
}

export default function SalaryIncrementPage() {
  const [result, setResult] = useState<SalaryIncrementComparisonDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const data = await apiPost<SalaryIncrementComparisonDTO>("/salary-increment", values);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to simulate increment");
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Salary Increment Planner</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        <input
          type="number"
          placeholder="New monthly salary (₹)"
          {...register("newMonthlySalary", { required: true, valueAsNumber: true })}
        />
        <button type="submit">Simulate</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <p>
            Salary change: ₹{result.currentSalary} → ₹{result.projectedSalary} (+₹{result.increaseAmount}, {result.increasePercent}%)
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "right" }}>Current</th>
                <th style={{ textAlign: "right" }}>Projected</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Necessities</td>
                <td style={{ textAlign: "right" }}>₹{result.current.necessitiesAmount}</td>
                <td style={{ textAlign: "right" }}>₹{result.projected.necessitiesAmount}</td>
              </tr>
              <tr>
                <td>Lifestyle</td>
                <td style={{ textAlign: "right" }}>₹{result.current.lifestyleAmount}</td>
                <td style={{ textAlign: "right" }}>₹{result.projected.lifestyleAmount}</td>
              </tr>
              <tr>
                <td>Savings</td>
                <td style={{ textAlign: "right" }}>₹{result.current.savingsAmount}</td>
                <td style={{ textAlign: "right" }}>₹{result.projected.savingsAmount}</td>
              </tr>
              <tr>
                <td>Investments</td>
                <td style={{ textAlign: "right" }}>₹{result.current.investmentsAmount}</td>
                <td style={{ textAlign: "right" }}>₹{result.projected.investmentsAmount}</td>
              </tr>
              <tr>
                <td>Goals</td>
                <td style={{ textAlign: "right" }}>₹{result.current.goalsAmount}</td>
                <td style={{ textAlign: "right" }}>₹{result.projected.goalsAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}