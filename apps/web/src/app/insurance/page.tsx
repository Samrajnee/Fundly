"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPost } from "@/lib/api";
import type { InsuranceDTO, InsuranceType, PremiumFrequency } from "@fundly/shared-types";

interface InsuranceFormValues {
  type: InsuranceType;
  provider: string;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  expiryDate: string;
  notes?: string;
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsuranceDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<InsuranceFormValues>({
    defaultValues: { type: "HEALTH", premiumFrequency: "YEARLY" },
  });

  async function loadData() {
    try {
      const data = await apiGet<InsuranceDTO[]>("/insurance");
      setPolicies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insurance policies");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onSubmit(values: InsuranceFormValues) {
    setError(null);
    try {
      await apiPost("/insurance", values);
      reset({ type: "HEALTH", premiumFrequency: "YEARLY" });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add insurance policy");
    }
  }

  const hasHealth = policies.some((p) => p.type === "HEALTH");
  const hasLife = policies.some((p) => p.type === "LIFE");

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Insurance Planner</h1>

      {(!hasHealth || !hasLife) && (
        <div style={{ border: "1px solid #d33", padding: "1rem", marginBottom: "2rem", color: "#d33" }}>
          Gap detected: you're missing {!hasHealth && !hasLife ? "health and life" : !hasHealth ? "health" : "life"} insurance.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
        <label>
          Type
          <select {...register("type")}>
            <option value="HEALTH">Health</option>
            <option value="LIFE">Life</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="HOME">Home</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        <label>
          Provider
          <input type="text" {...register("provider", { required: true })} />
        </label>

        <label>
          Coverage Amount (₹)
          <input type="number" step="0.01" {...register("coverageAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Premium Amount (₹)
          <input type="number" step="0.01" {...register("premiumAmount", { required: true, valueAsNumber: true })} />
        </label>

        <label>
          Premium Frequency
          <select {...register("premiumFrequency")}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </label>

        <label>
          Expiry Date
          <input type="date" {...register("expiryDate", { required: true })} />
        </label>

        <button type="submit">Add Policy</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Policies</h2>
      {policies.map((p) => (
        <div key={p.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <strong>{p.provider}</strong> — {p.type}
          {p.isExpiringSoon && <span style={{ color: "#d33", marginLeft: "0.5rem" }}>Expiring soon</span>}
          <p>Coverage: ₹{p.coverageAmount}</p>
          <p>Premium: ₹{p.premiumAmount} ({p.premiumFrequency.toLowerCase()})</p>
          <p>Expires: {new Date(p.expiryDate).toLocaleDateString()}</p>
        </div>
      ))}
    </main>
  );
}