"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import type { SalaryIncrementComparisonDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

interface FormValues { newMonthlySalary: number; }

export default function SalaryIncrementPage() {
  const [result, setResult] = useState<SalaryIncrementComparisonDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try { setResult(await apiPost<SalaryIncrementComparisonDTO>("/salary-increment", values)); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to simulate increment"); }
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Salary increment planner" description="See how a raise would change your plan before it happens." />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input type="number" placeholder="New monthly salary" {...register("newMonthlySalary", { required: true, valueAsNumber: true })} />
        <button onClick={handleSubmit(onSubmit)}>Simulate</button>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      {result && (
        <div>
          <p>
            Salary change: Rs {formatCurrency(result.currentSalary)} to Rs {formatCurrency(result.projectedSalary)} (+Rs {formatCurrency(result.increaseAmount)}, {result.increasePercent}%)
          </p>

          <Card style={{ padding: 0, marginTop: "1rem" }}>
            <table>
              <thead>
                <tr><th style={{ padding: "0.75rem 1rem" }}>Category</th><th style={{ textAlign: "right" }}>Current</th><th style={{ textAlign: "right", paddingRight: "1rem" }}>Projected</th></tr>
              </thead>
              <tbody>
                {[
                  ["Necessities", result.current.necessitiesAmount, result.projected.necessitiesAmount],
                  ["Lifestyle", result.current.lifestyleAmount, result.projected.lifestyleAmount],
                  ["Savings", result.current.savingsAmount, result.projected.savingsAmount],
                  ["Investments", result.current.investmentsAmount, result.projected.investmentsAmount],
                  ["Goals", result.current.goalsAmount, result.projected.goalsAmount],
                ].map(([label, cur, proj]) => (
                  <tr key={label as string}>
                    <td style={{ paddingLeft: "1rem" }}>{label}</td>
                    <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(cur as number)}</td>
                    <td className="num" style={{ textAlign: "right", paddingRight: "1rem" }}>Rs {formatCurrency(proj as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </main>
  );
}