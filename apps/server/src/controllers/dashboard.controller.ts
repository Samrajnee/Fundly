import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { calculateFinancialHealthScore } from "../services/healthScore.service";
import { postDueRecurringExpenses } from "../services/recurringPosting.service";
import { computeSafeToSpend } from "../services/safeToSpend.service";

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    await postDueRecurringExpenses(req.userId!);

    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: req.userId!, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const breakdown = activePlan
      ? {
          necessitiesAmount: Number(activePlan.necessitiesAmount),
          lifestyleAmount: Number(activePlan.lifestyleAmount),
          savingsAmount: Number(activePlan.savingsAmount),
          investmentsAmount: Number(activePlan.investmentsAmount),
          goalsAmount: Number(activePlan.goalsAmount),
          bufferAmount: Number(activePlan.bufferAmount),
        }
      : null;

    const safeToSpend = await computeSafeToSpend(req.userId!);

    const healthScoreFull = await calculateFinancialHealthScore(req.userId!);

    const investments = await prisma.investment.findMany({ where: { userId: req.userId! } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: req.userId! } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;
    const activeGoals = await prisma.goal.findMany({
      where: { userId: req.userId!, status: "ACTIVE" },
      orderBy: { targetDate: "asc" },
      take: 3,
    });
    const goalsSavings = activeGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
    const debts = await prisma.debt.findMany({ where: { userId: req.userId! } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);
    const netWorth = totalInvestments + emergencyFundAmount + goalsSavings - totalDebt;

    const allActiveGoalsCount = await prisma.goal.count({ where: { userId: req.userId!, status: "ACTIVE" } });
    const achievedMilestonesCount = await prisma.milestoneAchievement.count({ where: { userId: req.userId! } });

    let emergencyFundPercentComplete: number | null = null;
    if (activePlan && emergencyFund) {
      const necessities = Number(activePlan.necessitiesAmount);
      const target = necessities * emergencyFund.targetMonths;
      emergencyFundPercentComplete = target > 0 ? Math.round((Number(emergencyFund.currentAmount) / target) * 100) : 0;
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