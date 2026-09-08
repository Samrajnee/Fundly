"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MonthlyPlanDTO } from "@fundly/shared-types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlyPlanPage() {
  const [plan, setPlan] = useState<MonthlyPlanDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<MonthlyPlanDTO>("/monthly-plan/current")
      .then(setPlan)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!plan) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Monthly Financial Plan</h1>
      <h2>{MONTH_NAMES[plan.month - 1]} {plan.year}</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <tbody>
          <tr><td>Necessities</td><td style={{ textAlign: "right" }}>₹{plan.necessitiesTarget}</td></tr>
          <tr><td>Lifestyle</td><td style={{ textAlign: "right" }}>₹{plan.lifestyleTarget}</td></tr>
          <tr><td>Savings</td><td style={{ textAlign: "right" }}>₹{plan.savingsTarget}</td></tr>
          <tr><td>Investments</td><td style={{ textAlign: "right" }}>₹{plan.investmentsTarget}</td></tr>
          <tr><td>Goals</td><td style={{ textAlign: "right" }}>₹{plan.goalsTarget}</td></tr>
          <tr><td>Buffer</td><td style={{ textAlign: "right" }}>₹{plan.bufferTarget}</td></tr>
        </tbody>
      </table>

      <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "#666" }}>
        This snapshot is locked in for the month — it won't change even if you update your Salary Plan later. Next month, a new plan will be generated automatically from whatever your active Salary Plan is at that time.
      </p>
    </main>
  );
}