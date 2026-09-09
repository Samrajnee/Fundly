import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { calculateFinancialHealthScore } from "../services/healthScore.service";

const TEMP_USER_ID = "temp-user-id";

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: TEMP_USER_ID, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    let breakdown = null;
    let safeToSpend = null;

    if (activePlan) {
      breakdown = {
        necessitiesAmount: Number(activePlan.necessitiesAmount),
        lifestyleAmount: Number(activePlan.lifestyleAmount),
        savingsAmount: Number(activePlan.savingsAmount),
        investmentsAmount: Number(activePlan.investmentsAmount),
        goalsAmount: Number(activePlan.goalsAmount),
        bufferAmount: Number(activePlan.bufferAmount),
      };

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const lifestylePool = Number(activePlan.lifestyleAmount) + Number(activePlan.bufferAmount);
      const spentResult = await prisma.transaction.aggregate({
        where: { userId: TEMP_USER_ID, date: { gte: start, lt: end }, category: { type: "LIFESTYLE" } },
        _sum: { amount: true },
      });
      const spent = Number(spentResult._sum.amount ?? 0);
      const lifestyleBudgetRemaining = Math.max(lifestylePool - spent, 0);
      const daysLeftInMonth = Math.max(
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1,
        1
      );
      const dailySafeAmount = lifestyleBudgetRemaining / daysLeftInMonth;

      safeToSpend = {
        dailySafeAmount: Math.round(dailySafeAmount * 100) / 100,
        weeklySafeAmount: Math.round(dailySafeAmount * 7 * 100) / 100,
        lifestyleBudgetRemaining: Math.round(lifestyleBudgetRemaining * 100) / 100,
        daysLeftInMonth,
      };
    }

    const healthScoreFull = await calculateFinancialHealthScore();

    const investments = await prisma.investment.findMany({ where: { userId: TEMP_USER_ID } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: TEMP_USER_ID } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;
    const activeGoals = await prisma.goal.findMany({
      where: { userId: TEMP_USER_ID, status: "ACTIVE" },
      orderBy: { targetDate: "asc" },
      take: 3,
    });
    const goalsSavings = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const debts = await prisma.debt.findMany({ where: { userId: TEMP_USER_ID } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);
    const netWorth = totalInvestments + emergencyFundAmount + goalsSavings - totalDebt;

    const allActiveGoalsCount = await prisma.goal.count({ where: { userId: TEMP_USER_ID, status: "ACTIVE" } });

    const achievedMilestonesCount = await prisma.milestoneAchievement.count({
      where: { userId: TEMP_USER_ID },
    });

    let emergencyFundPercentComplete: number | null = null;
    if (activePlan && emergencyFund) {
      const necessities = Number(activePlan.necessitiesAmount);
      const target = necessities * emergencyFund.targetMonths;
      emergencyFundPercentComplete = target > 0
        ? Math.round((Number(emergencyFund.currentAmount) / target) * 100)
        : 0;
    }

    res.json({
      success: true,
      data: {
        hasActiveSalaryPlan: !!activePlan,
        monthlySalary: activePlan ? Number(activePlan.monthlySalary) : null,
        breakdown,
        safeToSpend,
        healthScore: { totalScore: healthScoreFull.totalScore, maxScore: healthScoreFull.maxScore },
        netWorth: Math.round(netWorth * 100) / 100,
        activeGoalsCount: allActiveGoalsCount,
        goalsSummary: activeGoals.map((g) => ({
          id: g.id,
          name: g.name,
          currentAmount: Number(g.currentAmount),
          targetAmount: Number(g.targetAmount),
        })),
        recentMilestonesCount: achievedMilestonesCount,
        emergencyFundPercentComplete,
      },
    });
  } catch (err) {
    next(err);
  }
}