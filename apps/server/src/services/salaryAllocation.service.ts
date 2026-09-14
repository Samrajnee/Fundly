import type { SalaryPlannerInput, SalaryBreakdown } from "@fundly/shared-types";

interface AllocationInput extends SalaryPlannerInput {
  incomeType?: "FIXED_SALARY" | "IRREGULAR" | "FREELANCE";
}

export function calculateSalaryBreakdown(input: AllocationInput): SalaryBreakdown {
  const { monthlySalary, livingSituation, supportsFamily, fixedExpenses, incomeType } = input;

  let necessitiesPct = 0.5;
  let lifestylePct = 0.2;
  let savingsPct = 0.15;
  let investmentsPct = 0.1;
  let goalsPct = 0.03;
  let bufferPct = 0.02;

  if (livingSituation === "RENTING_ALONE") {
    necessitiesPct = 0.55;
    lifestylePct = 0.15;
    savingsPct = 0.15;
    investmentsPct = 0.1;
    goalsPct = 0.03;
    bufferPct = 0.02;
  } else if (livingSituation === "WITH_PARENTS") {
    necessitiesPct = 0.3;
    lifestylePct = 0.25;
    savingsPct = 0.2;
    investmentsPct = 0.15;
    goalsPct = 0.07;
    bufferPct = 0.03;
  }

  if (supportsFamily) {
    necessitiesPct += 0.1;
    lifestylePct = Math.max(0.1, lifestylePct - 0.1);
  }

  // Irregular/freelance income: prioritize a bigger buffer over lifestyle/investments,
  // since monthly income can't be relied on the way a fixed salary can.
  if (incomeType === "IRREGULAR" || incomeType === "FREELANCE") {
    const shift = 0.05;
    lifestylePct = Math.max(0.05, lifestylePct - shift);
    investmentsPct = Math.max(0.05, investmentsPct - shift * 0.4);
    bufferPct += shift * 1.4;
  }

  const plannedNecessities = monthlySalary * necessitiesPct;
  const necessitiesAmount = Math.max(plannedNecessities, fixedExpenses);

  const remaining = Math.max(monthlySalary - necessitiesAmount, 0);
  const remainingWeightSum = lifestylePct + savingsPct + investmentsPct + goalsPct + bufferPct;

  const lifestyleAmount = remainingWeightSum > 0 ? remaining * (lifestylePct / remainingWeightSum) : 0;
  const savingsAmount = remainingWeightSum > 0 ? remaining * (savingsPct / remainingWeightSum) : 0;
  const investmentsAmount = remainingWeightSum > 0 ? remaining * (investmentsPct / remainingWeightSum) : 0;
  const goalsAmount = remainingWeightSum > 0 ? remaining * (goalsPct / remainingWeightSum) : 0;
  const bufferAmount = remainingWeightSum > 0 ? remaining * (bufferPct / remainingWeightSum) : 0;

  return {
    necessitiesAmount: round2(necessitiesAmount),
    lifestyleAmount: round2(lifestyleAmount),
    savingsAmount: round2(savingsAmount),
    investmentsAmount: round2(investmentsAmount),
    goalsAmount: round2(goalsAmount),
    bufferAmount: round2(bufferAmount),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}