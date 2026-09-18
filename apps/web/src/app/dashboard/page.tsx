"use client";

import { useTheme } from "@/lib/theme-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { apiGet } from "@/lib/api";
import type { DashboardDTO } from "@fundly/shared-types";
import { useCountUp } from "@/lib/useCountUp";

const BREAKDOWN_COLORS_LIGHT = [
  "#1b3a2b",
  "#a6832f",
  "#3f6b52",
  "#7c9b76",
  "#8a6c26",
  "#c7d1c1",
];

const BREAKDOWN_COLORS_DARK = [
  "#3e6b52",
  "#c6a24e",
  "#5a8a6c",
  "#8fae83",
  "#ddb75c",
  "#4a5f4c",
];

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const color =
    tone === "positive"
      ? "var(--color-primary)"
      : tone === "negative"
        ? "var(--color-danger)"
        : "var(--color-ink)";

  return (
    <div className="glass-surface" style={{ padding: "1.1rem 1.25rem" }}>
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--color-text-muted)",
          margin: "0 0 0.3rem",
        }}
      >
        {label}
      </p>

      <p
        className="num"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          fontWeight: 600,
          color,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();

  const breakdownColors =
    theme === "dark"
      ? BREAKDOWN_COLORS_DARK
      : BREAKDOWN_COLORS_LIGHT;

  const [data, setData] = useState<DashboardDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardDTO>("/dashboard")
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard"
        )
      );
  }, []);

  const safeToSpendAnimated = useCountUp(
    data?.safeToSpend?.dailySafeAmount ?? 0
  );

  if (error) {
    return (
      <main style={{ padding: "2.5rem" }}>
        <p style={{ color: "var(--color-danger)" }}>{error}</p>
      </main>
    );
  }

  if (!data) {
    return <main style={{ padding: "2.5rem" }}>Loading</main>;
  }

  if (!data.hasActiveSalaryPlan) {
    return (
      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "3rem 2.5rem",
        }}
      >
        <h1>Welcome to Fundly</h1>

        <p>
          Start by creating your salary plan to unlock your dashboard.
        </p>

        <Link href="/salary-planner">
          <button>Go to salary planner</button>
        </Link>
      </main>
    );
  }

  const breakdownData = data.breakdown
    ? [
        {
          name: "Necessities",
          value: data.breakdown.necessitiesAmount,
        },
        {
          name: "Lifestyle",
          value: data.breakdown.lifestyleAmount,
        },
        {
          name: "Savings",
          value: data.breakdown.savingsAmount,
        },
        {
          name: "Investments",
          value: data.breakdown.investmentsAmount,
        },
        {
          name: "Goals",
          value: data.breakdown.goalsAmount,
        },
        {
          name: "Buffer",
          value: data.breakdown.bufferAmount,
        },
      ]
    : [];

  return (
    <main
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "2.5rem",
      }}
    >
      <h1>Dashboard</h1>

      {/* Hero: Safe to Spend */}
      {data.safeToSpend && (
        <div
          className="glass-surface"
          style={{
            borderRadius: "var(--radius-lg)",
            padding: "1.75rem 2rem",
            marginTop: "1.5rem",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              margin: "0 0 0.4rem",
            }}
          >
            Safe to spend today
          </p>

          <p
            className="num"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.6rem",
              fontWeight: 500,
              color: "var(--color-accent-dark)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Rs {formatCurrency(safeToSpendAnimated)}
          </p>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              margin: "0.5rem 0 0",
            }}
          >
            {data.safeToSpend.daysLeftInMonth === 1
              ? "Today is the last day of the month"
              : `${data.safeToSpend.daysLeftInMonth} days left this month`}{" "}
            &middot; Rs{" "}
            {formatCurrency(
              data.safeToSpend.lifestyleBudgetRemaining
            )}{" "}
            lifestyle budget remaining
          </p>
        </div>
      )}

      {/* Secondary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr 1fr",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <StatCard
          label="Monthly salary"
          value={`Rs ${formatCurrency(data.monthlySalary ?? 0)}`}
        />

        <StatCard
          label="Net worth"
          value={`Rs ${formatCurrency(data.netWorth)}`}
          tone={data.netWorth >= 0 ? "positive" : "negative"}
        />

        {data.healthScore && (
          <StatCard
            label="Financial health"
            value={`${data.healthScore.totalScore} / ${data.healthScore.maxScore}`}
          />
        )}
      </div>

      {/* Salary breakdown chart */}
      {data.breakdown && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "2rem",
            alignItems: "center",
            marginTop: "2.5rem",
          }}
        >
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {breakdownData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        breakdownColors[
                          idx % breakdownColors.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `Rs ${formatCurrency(Number(value ?? 0))}`
                  }
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 style={{ marginTop: 0 }}>
              Your monthly breakdown
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {breakdownData.map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        breakdownColors[
                          idx % breakdownColors.length
                        ],
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "0.9rem",
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </span>

                  <span
                    className="num"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    Rs {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      <h2>Active goals ({data.activeGoalsCount})</h2>

      {data.goalsSummary.length === 0 ? (
        <p>
          No active goals.{" "}
          <Link href="/goals">Create one</Link>
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          {data.goalsSummary.map((g) => {
            const percent = Math.min(
              Math.round(
                (g.currentAmount / g.targetAmount) * 100
              ),
              100
            );

            return (
              <div key={g.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span>{g.name}</span>

                  <span
                    className="num"
                    style={{
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {percent}%
                  </span>
                </div>

                <div
                  style={{
                    background: "var(--color-surface-alt)",
                    height: "6px",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      background: "var(--color-primary)",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: "0.75rem" }}>
        <Link href="/goals">View all goals</Link>
      </p>

      {/* Emergency Fund */}
      {data.emergencyFundPercentComplete !== null && (
        <>
          <h2>Emergency fund</h2>

          <p>
            {data.emergencyFundPercentComplete}% complete
          </p>

          <Link href="/emergency-fund">View details</Link>
        </>
      )}

      {/* Milestones */}
      <h2>Milestones</h2>

      <p>{data.recentMilestonesCount} of 8 unlocked</p>

      <Link href="/milestones">View all</Link>

      {/* Financial Education */}
      <div style={{ marginTop: "2rem" }}>
      <Link href="/education" style={{ textDecoration: "none" }}>
        <button style={{ borderRadius: "999px" }}>
          Financial education
        </button>
      </Link>
      </div>
    </main>
  );
}
