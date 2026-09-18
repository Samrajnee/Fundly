"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type {
  BudgetProgressDTO,
  SafeToSpendDTO,
} from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

interface Category {
  id: string;
  name: string;
}

interface BudgetFormValues {
  categoryId: string;
  monthlyLimit: number;
}

export default function BudgetPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<BudgetProgressDTO[]>([]);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } =
    useForm<BudgetFormValues>();

  async function loadData() {
    try {
      const [cats, budgetProgress] = await Promise.all([
        apiGet<Category[]>("/categories"),
        apiGet<BudgetProgressDTO[]>("/budgets"),
      ]);

      setCategories(cats);
      setProgress(budgetProgress);

      try {
        setSafeToSpend(
          await apiGet<SafeToSpendDTO>("/safe-to-spend")
        );
      } catch {
        setSafeToSpend(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data"
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: BudgetFormValues) {
    setError(null);

    try {
      await apiPost("/budgets", {
        ...values,
        monthlyLimit: Number(values.monthlyLimit),
      });

      reset();
      loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set budget"
      );
    }
  }

  async function onDeleteBudget(budgetId: string) {
    if (!confirm("Delete this budget?")) return;

    try {
      await apiDelete(`/budgets/${budgetId}`);
      loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete budget"
      );
    }
  }

  return (
    <main
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "2.5rem",
      }}
    >
      <PageHeader title="Budget and safe-to-spend" />

      {safeToSpend && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              margin: "0 0 0.25rem",
            }}
          >
            Today's target
          </p>

          <p
            className="num"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.8rem",
              margin: 0,
              color: "var(--color-accent-dark)",
            }}
          >
            Rs {formatCurrency(safeToSpend.todayTarget)}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              margin: "0.9rem 0",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  margin: "0 0 0.15rem",
                }}
              >
                Spent today
              </p>

              <p
                className="num"
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Rs {formatCurrency(safeToSpend.spentToday)}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  margin: "0 0 0.15rem",
                }}
              >
                Remaining today
              </p>

              <p
                className="num"
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color:
                    safeToSpend.remainingToday < 0
                      ? "var(--color-danger)"
                      : "var(--color-primary)",
                }}
              >
                Rs {formatCurrency(safeToSpend.remainingToday)}
              </p>
            </div>
          </div>

          <div className="notice-banner">
            {safeToSpend.remainingToday < 0 ? (
              <>
                You've gone Rs{" "}
                {formatCurrency(
                  Math.abs(safeToSpend.remainingToday)
                )}{" "}
                over today's target.

                {safeToSpend.tomorrowProjectedTarget !== null && (
                  <>
                    {" "}
                    Tomorrow's target adjusts to roughly Rs{" "}
                    {formatCurrency(
                      safeToSpend.tomorrowProjectedTarget
                    )}{" "}
                    to balance it out.
                  </>
                )}
              </>
            ) : safeToSpend.spentToday > 0 ? (
              <>
                You're under budget today.

                {safeToSpend.tomorrowProjectedTarget !== null && (
                  <>
                    {" "}
                    Tomorrow's target rises to roughly Rs{" "}
                    {formatCurrency(
                      safeToSpend.tomorrowProjectedTarget
                    )}
                    .
                  </>
                )}
              </>
            ) : (
              <>
                Nothing logged yet today.

                {safeToSpend.tomorrowProjectedTarget !== null && (
                  <>
                    {" "}
                    If you spend nothing today, tomorrow's target
                    rises to roughly Rs{" "}
                    {formatCurrency(
                      safeToSpend.tomorrowProjectedTarget
                    )}
                    .
                  </>
                )}
              </>
            )}
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
              margin: "0.9rem 0 0",
            }}
          >
            Rs {formatCurrency(safeToSpend.weeklySafeAmount)} this
            week &middot;{" "}
            {safeToSpend.daysLeftInMonth === 1
              ? "today is the last day of the month"
              : `${safeToSpend.daysLeftInMonth} days left`}
          </p>
        </Card>
      )}

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Category

            <select
              {...register("categoryId", {
                required: true,
              })}
            >
              <option value="">Select category</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monthly limit (Rs)

            <input
              type="number"
              step="0.01"
              {...register("monthlyLimit", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </label>

          <button type="submit">
            Set budget
          </button>
        </form>
      </Card>

      {error && (
        <p
          style={{
            color: "var(--color-danger)",
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
      )}

      <h2>Budget progress</h2>
        {progress.length === 0 ? (
          <Card><p style={{ margin: 0 }}>Set a budget above to start tracking progress against it.</p></Card>
        ) : progress.map((p) => (
        <Card
          key={p.categoryId}
          style={{ marginBottom: "0.75rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <strong>{p.categoryName}</strong>

            <button
              onClick={() => onDeleteBudget(p.id)}
              style={{
                background: "transparent",
                color: "var(--color-danger)",
                border: "none",
                padding: 0,
                fontSize: "0.8rem",
              }}
            >
              Delete
            </button>
          </div>

          <div
            style={{
              background: "var(--color-surface-alt)",
              height: "6px",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "0.4rem",
            }}
          >
            <div
              style={{
                width: `${Math.min(p.percentUsed, 100)}%`,
                background:
                  p.percentUsed > 100
                    ? "var(--color-danger)"
                    : "var(--color-success)",
                height: "100%",
              }}
            />
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
            }}
          >
            Rs {formatCurrency(p.spent)} of Rs{" "}
            {formatCurrency(p.monthlyLimit)} spent (
            {p.percentUsed}%)
          </p>
        </Card>
      ))}
    </main>
  );
}