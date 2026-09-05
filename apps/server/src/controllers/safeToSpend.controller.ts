import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

export async function getSafeToSpend(_req: Request, res: Response, next: NextFunction) {
  try {
    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: TEMP_USER_ID, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!activePlan) {
      throw new AppError("No active salary plan found. Create one first.", 404);
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // "Safe to spend" pool = lifestyle allocation + unused buffer, minus what's
    // already been spent on lifestyle categories this month.
    const lifestylePool = Number(activePlan.lifestyleAmount) + Number(activePlan.bufferAmount);

    const spentResult = await prisma.transaction.aggregate({
      where: {
        userId: TEMP_USER_ID,
        date: { gte: start, lt: end },
        category: { type: "LIFESTYLE" },
      },
      _sum: { amount: true },
    });

    const spent = Number(spentResult._sum.amount ?? 0);
    const lifestyleBudgetRemaining = Math.max(lifestylePool - spent, 0);

    const daysInMonth = end.getDate() === 1 ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() : end.getDate();
    const today = now.getDate();
    const daysLeftInMonth = Math.max(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - today + 1, 1);

    const dailySafeAmount = lifestyleBudgetRemaining / daysLeftInMonth;
    const weeklySafeAmount = dailySafeAmount * 7;

    res.json({
      success: true,
      data: {
        dailySafeAmount: Math.round(dailySafeAmount * 100) / 100,
        weeklySafeAmount: Math.round(weeklySafeAmount * 100) / 100,
        lifestyleBudgetRemaining: Math.round(lifestyleBudgetRemaining * 100) / 100,
        daysLeftInMonth,
      },
    });
  } catch (err) {
    next(err);
  }
}