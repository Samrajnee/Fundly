"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { DebtDTO, DebtType } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface DebtFormValues {
  type: DebtType; lender: string; principalAmount: number; outstandingAmount: number;
  interestRate: number; emiAmount: number; tenureMonths: number; startDate: string;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<DebtFormValues>({ defaultValues: { type: "PERSONAL_LOAN" } });

  async function loadData() {
    try { setDebts(await apiGet<DebtDTO[]>("/debts")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load debts"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(values: DebtFormValues) {
    setError(null);
    try { await apiPost("/debts", values); reset({ type: "PERSONAL_LOAN" }); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add debt"); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this debt?")) return;
    try { await apiDelete(`/debts/${id}`); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
  }

  const totalEmi = debts.reduce((sum, d) => sum + d.emiAmount, 0);
  const totalOutstanding = debts.reduce((sum, d) => sum + d.outstandingAmount, 0);

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Debt and EMI planner" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <Card>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Monthly EMI</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", margin: 0 }}>Rs {formatCurrency(totalEmi)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 0.25rem" }}>Outstanding</p>
          <p className="num" style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", margin: 0 }}>Rs {formatCurrency(totalOutstanding)}</p>
        </Card>
      </div>

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Type
            <select {...register("type")}>
              <option value="CREDIT_CARD">Credit card</option><option value="PERSONAL_LOAN">Personal loan</option><option value="HOME_LOAN">Home loan</option><option value="VEHICLE_LOAN">Vehicle loan</option><option value="EDUCATION_LOAN">Education loan</option><option value="OTHER">Other</option>
            </select>
          </label>
          <label>Lender<input type="text" {...register("lender", { required: true })} /></label>
          <label>Principal amount (Rs)<input type="number" step="0.01" {...register("principalAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Outstanding amount (Rs)<input type="number" step="0.01" {...register("outstandingAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Interest rate (% p.a.)<input type="number" step="0.01" {...register("interestRate", { required: true, valueAsNumber: true })} /></label>
          <label>EMI amount (Rs)<input type="number" step="0.01" {...register("emiAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Tenure (months)<input type="number" {...register("tenureMonths", { required: true, valueAsNumber: true })} /></label>
          <label>Start date<input type="date" {...register("startDate", { required: true })} /></label>
          <button type="submit">Add debt</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      <h2>Your debts</h2>
      {debts.length === 0 ? (
        <EmptyState message="No debts recorded." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {debts.map((d) => (
            <Card key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{d.lender}</strong>
                <button onClick={() => onDelete(d.id)} style={{ background: "transparent", color: "var(--color-danger)", border: "none", padding: 0, fontSize: "0.8rem" }}>Delete</button>
              </div>
              <p style={{ fontSize: "0.85rem", margin: "0.15rem 0 0.6rem" }}>{d.type}</p>
              <div style={{ background: "var(--color-surface-alt)", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${d.percentPaidOff}%`, background: "var(--color-olive)", height: "100%" }} />
              </div>
              <p style={{ margin: "0 0 0.2rem", fontSize: "0.85rem" }}>{d.percentPaidOff}% paid off</p>
              <p className="num" style={{ margin: "0 0 0.2rem" }}>Rs {formatCurrency(d.outstandingAmount)} of Rs {formatCurrency(d.principalAmount)}</p>
              <p className="num" style={{ margin: 0, fontSize: "0.85rem" }}>Rs {formatCurrency(d.emiAmount)}/month at {d.interestRate}% interest</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}