import { prisma } from "@fundly/database";
import type { MilestoneDTO, MilestoneKey } from "@fundly/shared-types";

const MILESTONE_LABELS: Record<MilestoneKey, string> = {
  SAVED_50K: "Saved ₹50,000",
  SAVED_1L: "Saved ₹1,00,000",
  INVESTED_1L: "Invested ₹1,00,000",
  EMERGENCY_FUND_3_MONTHS: "3-Month Emergency Fund",
  EMERGENCY_FUND_6_MONTHS: "6-Month Emergency Fund",
  DEBT_FREE: "Debt-Free",
  FIRST_GOAL_COMPLETED: "First Goal Completed",
  NET_WORTH_POSITIVE: "Positive Net Worth",
};

export async function evaluateMilestones(userId: string): Promise<MilestoneDTO[]> {
  const [goals, debts, investments, emergencyFund, existingAchievements] = await Promise.all([
    prisma.goal.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId } }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.emergencyFund.findUnique({ where: { userId } }),
    prisma.milestoneAchievement.findMany({ where: { userId } }),
  ]);

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
    + (emergencyFund ? Number(emergencyFund.currentAmount) : 0);
  const totalInvested = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
  const totalOutstandingDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);
  const totalAssets = totalSaved + totalInvested;
  const netWorth = totalAssets - totalOutstandingDebt;

  const activeSalaryPlan = await prisma.salaryProfile.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const necessities = activeSalaryPlan ? Number(activeSalaryPlan.necessitiesAmount) : 0;
  const monthsCovered = necessities > 0 && emergencyFund ? Number(emergencyFund.currentAmount) / necessities : 0;

  const hasCompletedGoal = goals.some((g) => g.status === "COMPLETED");

  const checks: Record<MilestoneKey, boolean> = {
    SAVED_50K: totalSaved >= 50000,
    SAVED_1L: totalSaved >= 100000,
    INVESTED_1L: totalInvested >= 100000,
    EMERGENCY_FUND_3_MONTHS: monthsCovered >= 3,
    EMERGENCY_FUND_6_MONTHS: monthsCovered >= 6,
    DEBT_FREE: debts.length > 0 && totalOutstandingDebt <= 0,
    FIRST_GOAL_COMPLETED: hasCompletedGoal,
    NET_WORTH_POSITIVE: netWorth > 0,
  };

  const achievedKeys = new Set(existingAchievements.map((a) => a.key));

  for (const [key, achieved] of Object.entries(checks) as [MilestoneKey, boolean][]) {
    if (achieved && !achievedKeys.has(key)) {
      await prisma.milestoneAchievement.create({
        data: { userId, key },
      });
      achievedKeys.add(key);
    }
  }

  const finalAchievements = await prisma.milestoneAchievement.findMany({
    where: { userId },
  });
  const achievedMap = new Map(finalAchievements.map((a) => [a.key, a.achievedAt]));

  return (Object.keys(MILESTONE_LABELS) as MilestoneKey[]).map((key) => ({
    key,
    label: MILESTONE_LABELS[key],
    achieved: achievedMap.has(key),
    achievedAt: achievedMap.get(key)?.toISOString() ?? null,
  }));
}