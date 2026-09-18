import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

export async function getSafeToSpend(req: Request, res: Response, next: NextFunction) {
  try {
    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: req.userId!, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!activePlan) {
      throw new AppError("No active salary plan found. Create one first.", 404);
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lifestylePool = Number(activePlan.lifestyleAmount) + Number(activePlan.bufferAmount);

    const [spentBeforeTodayResult, spentTodayResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId: req.userId!, date: { gte: monthStart, lt: todayStart }, category: { type: "LIFESTYLE" } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: req.userId!, date: { gte: todayStart, lt: monthEnd }, category: { type: "LIFESTYLE" } },
        _sum: { amount: true },
      }),
    ]);

    const spentBeforeToday = Number(spentBeforeTodayResult._sum.amount ?? 0);
    const spentToday = Number(spentTodayResult._sum.amount ?? 0);

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeftInMonth = Math.max(daysInMonth - now.getDate() + 1, 1);

    // What today's target *was*, before today's spending is factored in.
    const remainingAtStartOfToday = Math.max(lifestylePool - spentBeforeToday, 0);
    const todayTarget = remainingAtStartOfToday / daysLeftInMonth;

    // What's actually left to spend today, after today's transactions.
    const remainingToday = todayTarget - spentToday;

    // The live "safe to spend" figure, spread evenly including today's leftover/shortfall.
    const remainingOverall = Math.max(lifestylePool - spentBeforeToday - spentToday, 0);
    const dailySafeAmount = remainingOverall / daysLeftInMonth;

    // Explicitly project tomorrow's number so the effect of today's spending is visible now,
    // not just discovered tomorrow.
    const daysLeftTomorrow = daysLeftInMonth - 1;
    const tomorrowProjectedTarget = daysLeftTomorrow > 0 ? remainingOverall / daysLeftTomorrow : null;

    res.json({
      success: true,
      data: {
        dailySafeAmount: Math.round(dailySafeAmount * 100) / 100,
        weeklySafeAmount: Math.round(dailySafeAmount * 7 * 100) / 100,
        lifestyleBudgetRemaining: Math.round(remainingOverall * 100) / 100,
        daysLeftInMonth,
        todayTarget: Math.round(todayTarget * 100) / 100,
        spentToday: Math.round(spentToday * 100) / 100,
        remainingToday: Math.round(remainingToday * 100) / 100,
        tomorrowProjectedTarget: tomorrowProjectedTarget !== null ? Math.round(tomorrowProjectedTarget * 100) / 100 : null,
      },
    });
  } catch (err) {
    next(err);
  }
}