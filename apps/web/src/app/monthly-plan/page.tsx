"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MonthlyPlanDTO } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MonthlyPlanPage() {
  const [plan, setPlan] = useState<MonthlyPlanDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<MonthlyPlanDTO>("/monthly-plan/current").then(setPlan).catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!plan) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Monthly financial plan" description={`${MONTH_NAMES[plan.month - 1]} ${plan.year}`} />

      <Card style={{ padding: 0 }}>
        <table>
          <tbody>
            {[["Necessities", plan.necessitiesTarget], ["Lifestyle", plan.lifestyleTarget], ["Savings", plan.savingsTarget], ["Investments", plan.investmentsTarget], ["Goals", plan.goalsTarget], ["Buffer", plan.bufferTarget]].map(([l, v], idx, arr) => (
              <tr key={l as string}>
                <td style={{ paddingLeft: "1rem", border: idx === arr.length - 1 ? "none" : undefined }}>{l}</td>
                <td className="num" style={{ textAlign: "right", paddingRight: "1rem", border: idx === arr.length - 1 ? "none" : undefined }}>Rs {formatCurrency(v as number)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p style={{ marginTop: "1.25rem", fontSize: "0.85rem" }}>
        This snapshot is locked in for the month. It won't change even if you update your salary plan later.
      </p>
    </main>
  );
}