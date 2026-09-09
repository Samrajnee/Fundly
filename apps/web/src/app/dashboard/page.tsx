"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { DashboardDTO } from "@fundly/shared-types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardDTO>("/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!data) return <main style={{ padding: "2rem" }}>Loading...</main>;

  if (!data.hasActiveSalaryPlan) {
    return (
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
        <h1>Welcome to Fundly</h1>
        <p>Start by creating your Salary Plan to unlock your dashboard.</p>
        <Link href="/salary-planner">Go to Salary Planner →</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <h1>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <small>Monthly Salary</small>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>₹{data.monthlySalary}</div>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <small>Net Worth</small>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: data.netWorth >= 0 ? "#3a3" : "#d33" }}>
            ₹{data.netWorth}
          </div>
        </div>

        {data.safeToSpend && (
          <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
            <small>Safe to Spend Today</small>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>₹{data.safeToSpend.dailySafeAmount}</div>
            <small>{data.safeToSpend.daysLeftInMonth} days left this month</small>
          </div>
        )}

        {data.healthScore && (
          <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
            <small>Financial Health Score</small>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {data.healthScore.totalScore} / {data.healthScore.maxScore}
            </div>
            <Link href="/health-score">View breakdown →</Link>
          </div>
        )}
      </div>

      {data.breakdown && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Salary Breakdown</h2>
          <ul>
            <li>Necessities: ₹{data.breakdown.necessitiesAmount}</li>
            <li>Lifestyle: ₹{data.breakdown.lifestyleAmount}</li>
            <li>Savings: ₹{data.breakdown.savingsAmount}</li>
            <li>Investments: ₹{data.breakdown.investmentsAmount}</li>
            <li>Goals: ₹{data.breakdown.goalsAmount}</li>
            <li>Buffer: ₹{data.breakdown.bufferAmount}</li>
          </ul>
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Active Goals ({data.activeGoalsCount})</h2>
        {data.goalsSummary.length === 0 ? (
          <p>No active goals. <Link href="/goals">Create one →</Link></p>
        ) : (
          data.goalsSummary.map((g) => {
            const percent = Math.round((g.currentAmount / g.targetAmount) * 100);
            return (
              <div key={g.id} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{g.name}</span>
                  <span>{percent}%</span>
                </div>
                <div style={{ background: "#eee", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(percent, 100)}%`, background: "#3a3", height: "100%" }} />
                </div>
              </div>
            );
          })
        )}
        <Link href="/goals">View all goals →</Link>
      </div>

      {data.emergencyFundPercentComplete !== null && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>Emergency Fund</h2>
          <p>{data.emergencyFundPercentComplete}% complete</p>
          <Link href="/emergency-fund">View details →</Link>
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Milestones Achieved</h2>
        <p>{data.recentMilestonesCount} of 8 milestones unlocked</p>
        <Link href="/milestones">View all →</Link>
      </div>
    </main>
  );
}