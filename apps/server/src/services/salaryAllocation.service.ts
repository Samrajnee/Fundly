import type { SalaryPlannerInput, SalaryBreakdown } from "@fundly/shared-types";

export function calculateSalaryBreakdown(input: SalaryPlannerInput): SalaryBreakdown {
  const { monthlySalary, livingSituation, supportsFamily, fixedExpenses } = input;

  let necessitiesPct = 0.5;
  let lifestylePct = 0.2;
  let savingsPct = 0.15;
  let investmentsPct = 0.1;
  let goalsPct = 0.05;

  if (livingSituation === "RENTING_ALONE") {
    necessitiesPct = 0.55;
    lifestylePct = 0.15;
    savingsPct = 0.15;
    investmentsPct = 0.1;
    goalsPct = 0.05;
  } else if (livingSituation === "WITH_PARENTS") {
    necessitiesPct = 0.3;
    lifestylePct = 0.25;
    savingsPct = 0.2;
    investmentsPct = 0.15;
    goalsPct = 0.1;
  }

  if (supportsFamily) {
    necessitiesPct += 0.1;
    lifestylePct = Math.max(0.1, lifestylePct - 0.1);
  }

  // Necessities = whichever is larger: the planned share, or actual fixed costs.
  const plannedNecessities = monthlySalary * necessitiesPct;
  const necessitiesAmount = Math.max(plannedNecessities, fixedExpenses);

  // Whatever's left after necessities gets split across the remaining categories,
  // proportionally to their original weights. This guarantees the total never
  // exceeds salary, even when fixedExpenses pushed necessities above its planned share.
  const remaining = Math.max(monthlySalary - necessitiesAmount, 0);
  const remainingWeightSum = lifestylePct + savingsPct + investmentsPct + goalsPct;

  const lifestyleAmount = remainingWeightSum > 0 ? remaining * (lifestylePct / remainingWeightSum) : 0;
  const savingsAmount = remainingWeightSum > 0 ? remaining * (savingsPct / remainingWeightSum) : 0;
  const investmentsAmount = remainingWeightSum > 0 ? remaining * (investmentsPct / remainingWeightSum) : 0;
  const goalsAmount = remainingWeightSum > 0 ? remaining * (goalsPct / remainingWeightSum) : 0;

  const allocated = necessitiesAmount + lifestyleAmount + savingsAmount + investmentsAmount + goalsAmount;
  const bufferAmount = Math.max(monthlySalary - allocated, 0);

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