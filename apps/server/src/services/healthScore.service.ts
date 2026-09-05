import { prisma } from "@fundly/database";
import type { FinancialHealthScoreDTO, HealthScoreComponent } from "@fundly/shared-types";

const TEMP_USER_ID = "temp-user-id";
const COMPONENT_MAX = 25;

export async function calculateFinancialHealthScore(): Promise<FinancialHealthScoreDTO> {
  const components: HealthScoreComponent[] = [];

  // 1. Savings Rate: (savings + investments) / salary
  const activePlan = await prisma.salaryProfile.findFirst({
    where: { userId: TEMP_USER_ID, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (activePlan) {
    const salary = Number(activePlan.monthlySalary);
    const savingsRate = salary > 0
      ? (Number(activePlan.savingsAmount) + Number(activePlan.investmentsAmount)) / salary
      : 0;
    const savingsScore = Math.min(Math.round(savingsRate / 0.2 * COMPONENT_MAX), COMPONENT_MAX);

    components.push({
      label: "Savings Rate",
      score: savingsScore,
      maxScore: COMPONENT_MAX,
      message:
        savingsRate >= 0.2
          ? "You're saving and investing a healthy share of your income."
          : "Try to push savings + investments toward 20% of your salary.",
    });
  } else {
    components.push({
      label: "Savings Rate",
      score: 0,
      maxScore: COMPONENT_MAX,
      message: "Create a Salary Plan to measure your savings rate.",
    });
  }

  // 2. Debt-to-Income Ratio: total EMI / salary
  const debts = await prisma.debt.findMany({ where: { userId: TEMP_USER_ID } });
  const totalEmi = debts.reduce((sum, d) => sum + Number(d.emiAmount), 0);

  if (activePlan) {
    const salary = Number(activePlan.monthlySalary);
    const debtRatio = salary > 0 ? totalEmi / salary : 0;
    // 0% debt ratio = full marks; 40%+ = zero marks
    const debtScore = Math.max(Math.round((1 - debtRatio / 0.4) * COMPONENT_MAX), 0);

    components.push({
      label: "Debt-to-Income Ratio",
      score: Math.min(debtScore, COMPONENT_MAX),
      maxScore: COMPONENT_MAX,
      message:
        debtRatio <= 0.2
          ? "Your EMI load is well within a healthy range."
          : "Your EMIs are taking up a large share of your salary — consider prioritizing repayment.",
    });
  } else {
    components.push({
      label: "Debt-to-Income Ratio",
      score: COMPONENT_MAX,
      maxScore: COMPONENT_MAX,
      message: "No active salary plan to compare against, but no debt tracked either.",
    });
  }

  // 3. Insurance Coverage: has HEALTH and LIFE policies
  const policies = await prisma.insurancePolicy.findMany({ where: { userId: TEMP_USER_ID } });
  const hasHealth = policies.some((p) => p.type === "HEALTH");
  const hasLife = policies.some((p) => p.type === "LIFE");
  const insuranceScore = (hasHealth ? COMPONENT_MAX / 2 : 0) + (hasLife ? COMPONENT_MAX / 2 : 0);

  components.push({
    label: "Insurance Coverage",
    score: Math.round(insuranceScore),
    maxScore: COMPONENT_MAX,
    message:
      hasHealth && hasLife
        ? "You have both health and life coverage."
        : !hasHealth && !hasLife
        ? "You have no health or life insurance on record — this is a real gap."
        : `You're missing ${hasHealth ? "life" : "health"} insurance.`,
  });

  // 4. Goal Progress: average % completion across active goals
  const goals = await prisma.goal.findMany({ where: { userId: TEMP_USER_ID, status: "ACTIVE" } });
  if (goals.length > 0) {
    const avgProgress =
      goals.reduce((sum, g) => sum + Number(g.currentAmount) / Number(g.targetAmount), 0) / goals.length;
    const goalScore = Math.round(Math.min(avgProgress, 1) * COMPONENT_MAX);

    components.push({
      label: "Goal Progress",
      score: goalScore,
      maxScore: COMPONENT_MAX,
      message:
        avgProgress >= 0.5
          ? "You're making solid progress on your financial goals."
          : "Your goals could use more consistent monthly contributions.",
    });
  } else {
    components.push({
      label: "Goal Progress",
      score: 0,
      maxScore: COMPONENT_MAX,
      message: "You haven't set any financial goals yet.",
    });
  }

  const totalScore = components.reduce((sum, c) => sum + c.score, 0);
  const maxScore = components.reduce((sum, c) => sum + c.maxScore, 0);

  return { totalScore, maxScore, components };
}