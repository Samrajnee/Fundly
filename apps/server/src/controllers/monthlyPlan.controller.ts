import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

export async function getOrCreateMonthlyPlan(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let plan = await prisma.monthlyPlan.findUnique({
      where: { userId_month_year: { userId: TEMP_USER_ID, month, year } },
    });

    if (!plan) {
      const activePlan = await prisma.salaryProfile.findFirst({
        where: { userId: TEMP_USER_ID, isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activePlan) {
        throw new AppError("No active salary plan found. Create one first.", 404);
      }

      plan = await prisma.monthlyPlan.create({
        data: {
          userId: TEMP_USER_ID,
          month,
          year,
          necessitiesTarget: activePlan.necessitiesAmount,
          lifestyleTarget: activePlan.lifestyleAmount,
          savingsTarget: activePlan.savingsAmount,
          investmentsTarget: activePlan.investmentsAmount,
          goalsTarget: activePlan.goalsAmount,
          bufferTarget: activePlan.bufferAmount,
        },
      });
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

export async function listMonthlyPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.monthlyPlan.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}