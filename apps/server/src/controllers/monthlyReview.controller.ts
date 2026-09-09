import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

export async function getMonthlyReview(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const plan = await prisma.monthlyPlan.findUnique({
      where: { userId_month_year: { userId: TEMP_USER_ID, month, year } },
    });

    if (!plan) {
      throw new AppError("No monthly plan found for this month. Visit Monthly Plan first.", 404);
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const spendByType = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: TEMP_USER_ID, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    // Map categoryId -> type, then aggregate by type
    const categories = await prisma.category.findMany({ where: { userId: TEMP_USER_ID } });
    const categoryTypeMap = new Map(categories.map((c) => [c.id, c.type]));

    const actualByType: Record<string, number> = {
      NECESSITY: 0,
      LIFESTYLE: 0,
      SAVINGS: 0,
      INVESTMENT: 0,
      GOAL: 0,
    };

    for (const row of spendByType) {
      const type = categoryTypeMap.get(row.categoryId);
      if (type) {
        actualByType[type] += Number(row._sum.amount ?? 0);
      }
    }

    function buildComparison(label: string, planned: number, actual: number) {
      const variance = Math.round((actual - planned) * 100) / 100;
      const variancePercent = planned > 0 ? Math.round((variance / planned) * 10000) / 100 : 0;
      return { label, planned, actual: Math.round(actual * 100) / 100, variance, variancePercent };
    }

    const comparisons = [
      buildComparison("Necessities", Number(plan.necessitiesTarget), actualByType.NECESSITY),
      buildComparison("Lifestyle", Number(plan.lifestyleTarget), actualByType.LIFESTYLE),
      buildComparison("Savings", Number(plan.savingsTarget), actualByType.SAVINGS),
      buildComparison("Investments", Number(plan.investmentsTarget), actualByType.INVESTMENT),
      buildComparison("Goals", Number(plan.goalsTarget), actualByType.GOAL),
    ];

    const totalPlanned = comparisons.reduce((sum, c) => sum + c.planned, 0);
    const totalActual = comparisons.reduce((sum, c) => sum + c.actual, 0);
    const savingsRateActual = totalActual > 0
      ? Math.round(((actualByType.SAVINGS + actualByType.INVESTMENT) / totalActual) * 10000) / 100
      : 0;

    res.json({
      success: true,
      data: { month, year, comparisons, totalPlanned, totalActual, savingsRateActual },
    });
  } catch (err) {
    next(err);
  }
}