"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import type { SalaryBreakdown } from "@fundly/shared-types";

const formSchema = z.object({
  monthlySalary: z.number().positive("Enter a valid salary"),
  livingSituation: z.enum(["WITH_PARENTS", "RENTING_ALONE", "RENTING_SHARED", "OWN_HOME"]),
  supportsFamily: z.boolean(),
  fixedExpenses: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SalaryPlannerPage() {
  const [result, setResult] = useState<SalaryBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supportsFamily: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<SalaryBreakdown>("/salary", values);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <h1>Salary Planner</h1>
      <p>Enter your salary and situation to get your monthly breakdown.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Monthly Salary (₹)
            <input type="number" {...register("monthlySalary", { valueAsNumber: true })} />          {errors.monthlySalary && <p style={{ color: "red" }}>{errors.monthlySalary.message}</p>}
        </label>

        <label>
          Living Situation
          <select {...register("livingSituation")}>
            <option value="WITH_PARENTS">With Parents</option>
            <option value="RENTING_ALONE">Renting Alone</option>
            <option value="RENTING_SHARED">Renting Shared</option>
            <option value="OWN_HOME">Own Home</option>
          </select>
        </label>

        <label>
          <input type="checkbox" {...register("supportsFamily")} />
          I support family financially
        </label>

        <label>
          Fixed Monthly Expenses (₹)
            <input type="number" {...register("fixedExpenses", { valueAsNumber: true })} />          {errors.fixedExpenses && <p style={{ color: "red" }}>{errors.fixedExpenses.message}</p>}
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Generate Plan"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Your Monthly Breakdown</h2>
          <ul>
            <li>Necessities: ₹{result.necessitiesAmount}</li>
            <li>Lifestyle: ₹{result.lifestyleAmount}</li>
            <li>Savings: ₹{result.savingsAmount}</li>
            <li>Investments: ₹{result.investmentsAmount}</li>
            <li>Goals: ₹{result.goalsAmount}</li>
            <li>Buffer: ₹{result.bufferAmount}</li>
          </ul>
        </div>
      )}
    </main>
  );
}