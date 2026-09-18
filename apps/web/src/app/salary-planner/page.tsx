"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import type { SalaryBreakdown } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Callout } from "@/components/ui/Callout";

const formSchema = z.object({
  monthlySalary: z.number().positive("Enter a valid salary"),
  livingSituation: z.enum(["WITH_PARENTS", "RENTING_ALONE", "RENTING_SHARED", "OWN_HOME"]),
  supportsFamily: z.boolean(),
  fixedExpenses: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

interface SalaryPlanResult extends SalaryBreakdown {
  reasoning?: string;
  source?: string;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

export default function SalaryPlannerPage() {
  const [result, setResult] = useState<SalaryPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { supportsFamily: false },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<SalaryPlanResult>("/salary", values);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader
        title="Salary planner"
        description="Enter your salary and situation to get a plan tailored to you, not a fixed formula."
      />
      <p style={{ marginTop: "-1.2rem", marginBottom: "1.75rem" }}>
        <Link href="/salary-history">View salary history</Link>
      </p>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Monthly salary (Rs)
            <input type="number" {...register("monthlySalary", { valueAsNumber: true })} />
          </label>
          {errors.monthlySalary && <p style={{ color: "var(--color-danger)", marginTop: "-0.75rem" }}>{errors.monthlySalary.message}</p>}

          <label>
            Living situation
            <select {...register("livingSituation")}>
              <option value="WITH_PARENTS">With parents</option>
              <option value="RENTING_ALONE">Renting alone</option>
              <option value="RENTING_SHARED">Renting shared</option>
              <option value="OWN_HOME">Own home</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" style={{ width: "auto" }} {...register("supportsFamily")} />
            I support family financially
          </label>

          <label>
            Fixed monthly expenses (Rs)
            <input type="number" {...register("fixedExpenses", { valueAsNumber: true })} />
          </label>
          {errors.fixedExpenses && <p style={{ color: "var(--color-danger)", marginTop: "-0.75rem" }}>{errors.fixedExpenses.message}</p>}

          <button type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Calculating" : "Generate plan"}
          </button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Your monthly breakdown</h2>

          {result.reasoning && (
            <Callout>
              {result.reasoning}
              {result.source === "RULE_BASED" && (
                <span style={{ display: "block", color: "var(--color-text-muted)", marginTop: "0.35rem", fontSize: "0.82rem" }}>
                  Standard allocation - AI temporarily unavailable
                </span>
              )}
            </Callout>
          )}

          <Card>
            {[
              ["Necessities", result.necessitiesAmount],
              ["Lifestyle", result.lifestyleAmount],
              ["Savings", result.savingsAmount],
              ["Investments", result.investmentsAmount],
              ["Goals", result.goalsAmount],
              ["Buffer", result.bufferAmount],
            ].map(([label, amount], idx, arr) => (
              <div
                key={label as string}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.6rem 0",
                  borderBottom: idx < arr.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span>{label}</span>
                <span className="num" style={{ fontWeight: 500 }}>Rs {formatCurrency(amount as number)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </main>
  );
}