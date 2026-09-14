"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPatch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { LivingSituation, IncomeType } from "@fundly/shared-types";

interface OnboardingFormValues {
  livingSituation: LivingSituation;
  incomeType: IncomeType;
  supportsFamily: boolean;
  isFirstSalary: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<OnboardingFormValues>({
    defaultValues: { incomeType: "FIXED_SALARY", supportsFamily: false, isFirstSalary: false },
  });

  async function onSubmit(values: OnboardingFormValues) {
    setError(null);
    try {
      await apiPatch("/profile", values);
      await refresh();
      router.push(values.isFirstSalary ? "/onboarding/first-salary" : "/salary-planner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "2rem auto", padding: "2rem" }}>
      <h1>Tell us about your situation</h1>
      <p>Fundly adapts your plan based on this - you can change it anytime later.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
        <label>
          Living Situation
          <select {...register("livingSituation", { required: true })}>
            <option value="WITH_PARENTS">Living with parents</option>
            <option value="RENTING_ALONE">Renting alone</option>
            <option value="RENTING_SHARED">Renting with roommates</option>
            <option value="OWN_HOME">Own home</option>
          </select>
        </label>

        <label>
          Income Type
          <select {...register("incomeType")}>
            <option value="FIXED_SALARY">Fixed monthly salary</option>
            <option value="IRREGULAR">Irregular income</option>
            <option value="FREELANCE">Freelance / contract work</option>
          </select>
        </label>

        <label>
          <input type="checkbox" {...register("supportsFamily")} />
          I financially support family members
        </label>

        <label>
          <input type="checkbox" {...register("isFirstSalary")} />
          This is my first salary - guide me through it
        </label>

        <button type="submit">Continue</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}