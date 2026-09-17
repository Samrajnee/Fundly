"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import type { InsuranceDTO, InsuranceType, PremiumFrequency } from "@fundly/shared-types";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface InsuranceFormValues {
  type: InsuranceType; provider: string; coverageAmount: number; premiumAmount: number;
  premiumFrequency: PremiumFrequency; expiryDate: string;
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsuranceDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<InsuranceFormValues>({ defaultValues: { type: "HEALTH", premiumFrequency: "YEARLY" } });

  async function loadData() {
    try { setPolicies(await apiGet<InsuranceDTO[]>("/insurance")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load insurance policies"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(values: InsuranceFormValues) {
    setError(null);
    try { await apiPost("/insurance", values); reset({ type: "HEALTH", premiumFrequency: "YEARLY" }); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add policy"); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this policy?")) return;
    try { await apiDelete(`/insurance/${id}`); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
  }

  const hasHealth = policies.some((p) => p.type === "HEALTH");
  const hasLife = policies.some((p) => p.type === "LIFE");

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Insurance planner" />

      {(!hasHealth || !hasLife) && (
        <Card style={{ marginBottom: "1.5rem", borderColor: "var(--color-danger-light)", background: "var(--color-danger-light)" }}>
          <p style={{ margin: 0, color: "var(--color-danger)" }}>
            Gap detected: missing {!hasHealth && !hasLife ? "health and life" : !hasHealth ? "health" : "life"} insurance.
          </p>
        </Card>
      )}

      <Card style={{ marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Type
            <select {...register("type")}>
              <option value="HEALTH">Health</option><option value="LIFE">Life</option><option value="VEHICLE">Vehicle</option><option value="HOME">Home</option><option value="OTHER">Other</option>
            </select>
          </label>
          <label>Provider<input type="text" {...register("provider", { required: true })} /></label>
          <label>Coverage amount (Rs)<input type="number" step="0.01" {...register("coverageAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Premium amount (Rs)<input type="number" step="0.01" {...register("premiumAmount", { required: true, valueAsNumber: true })} /></label>
          <label>Premium frequency
            <select {...register("premiumFrequency")}>
              <option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option><option value="YEARLY">Yearly</option>
            </select>
          </label>
          <label>Expiry date<input type="date" {...register("expiryDate", { required: true })} /></label>
          <button type="submit">Add policy</button>
        </form>
      </Card>

      {error && <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>}

      <h2>Your policies</h2>
      {policies.length === 0 ? (
        <EmptyState message="No policies recorded." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {policies.map((p) => (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <strong>{p.provider}</strong>
                  <span style={{ fontSize: "0.85rem", marginLeft: "0.5rem", color: "var(--color-text-muted)" }}>{p.type}</span>
                  {p.isExpiringSoon && <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem", fontSize: "0.8rem" }}>Expiring soon</span>}
                </div>
                <button onClick={() => onDelete(p.id)} style={{ background: "transparent", color: "var(--color-danger)", border: "none", padding: 0, fontSize: "0.8rem" }}>Delete</button>
              </div>
              <p className="num" style={{ margin: "0.5rem 0 0.15rem" }}>Coverage: Rs {formatCurrency(p.coverageAmount)}</p>
              <p className="num" style={{ margin: "0 0 0.15rem" }}>Premium: Rs {formatCurrency(p.premiumAmount)} ({p.premiumFrequency.toLowerCase()})</p>
              <p style={{ margin: 0, fontSize: "0.85rem" }}>Expires: {new Date(p.expiryDate).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}