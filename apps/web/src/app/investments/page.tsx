"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { InvestmentDTO, InvestmentType } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface InvestmentFormValues {
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  startDate: string;
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<InvestmentFormValues>({ defaultValues: { type: "MUTUAL_FUND" } });

  async function loadData() {
    try { setInvestments(await apiGet<InvestmentDTO[]>("/investments")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load investments"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(values: InvestmentFormValues) {
    setError(null);
    try { await apiPost("/investments", values); reset({ type: "MUTUAL_FUND" }); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add investment"); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this investment?")) return;
    try { await apiDelete(`/investments/${id}`); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
  }

  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentValue, 0);

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Investment overview" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Invested</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", margin: 0 }}>Rs {formatCurrency(totalInvested)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Current value</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", margin: 0 }}>Rs {formatCurrency(totalCurrent)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Gain / loss</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", margin: 0, color: totalCurrent >= totalInvested ? "var(--color-olive-dark)" : "var(--color-danger)" }}>
            Rs {formatCurrency(totalCurrent - totalInvested)}
          </p>
        </Card>
      </div>

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Type
            <select {...register("type")}>
              <option value="MUTUAL_FUND">Mutual fund</option><option value="FIXED_DEPOSIT">Fixed deposit</option><option value="PPF">PPF</option><option value="EPF">EPF</option><option value="NPS">NPS</option><option value="STOCKS">Stocks</option><option value="OTHER">Other</option>
            </select>
          </label>
          <label>Name<input type="text" {...register("name", { required: true })} /></label>
          <label>Invested amount (Rs)<input type="number" step="0.01" {...register("investedAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Current value (Rs)<input type="number" step="0.01" {...register("currentValue", { required: true, valueAsNumber: true })} /></label>
          <label>Start date<input type="date" {...register("startDate", { required: true })} /></label>
          <button type="submit">Add investment</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      <h2>Your investments</h2>
      {investments.length === 0 ? (
        <EmptyState message="No investments recorded yet." />
      ) : (
        <Card style={{ padding: 0 }}>
          <table>
            <thead><tr><th style={{ padding: "0.75rem 1rem" }}>Name</th><th>Type</th><th style={{ textAlign: "right" }}>Invested</th><th style={{ textAlign: "right" }}>Current</th><th style={{ textAlign: "right", paddingRight: "1rem" }}></th></tr></thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ paddingLeft: "1rem" }}>{inv.name}</td>
                  <td>{inv.type}</td>
                  <td className="num" style={{ textAlign: "right" }}>Rs {formatCurrency(inv.investedAmount)}</td>
                  <td className="num" style={{ textAlign: "right", color: inv.gainLoss >= 0 ? "var(--color-olive-dark)" : "var(--color-danger)" }}>
                    Rs {formatCurrency(inv.currentValue)}
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "1rem" }}>
                    <button onClick={() => onDelete(inv.id)} style={{ background: "transparent", color: "var(--color-danger)", border: "none", padding: 0, fontSize: "0.8rem" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </main>
  );
}