import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";



export async function getOrCreateMonthlyPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let plan = await prisma.monthlyPlan.findUnique({
      where: { userId_month_year: { userId: req.userId!, month, year } },
    });

    if (!plan) {
      const activePlan = await prisma.salaryProfile.findFirst({
        where: { userId: req.userId!, isActive: true },
        orderBy: { createdAt: "desc" },
      });

      if (!activePlan) {
        throw new AppError("No active salary plan found. Create one first.", 404);
      }

      plan = await prisma.monthlyPlan.create({
        data: {
          userId: req.userId!,
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

export async function listMonthlyPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.monthlyPlan.findMany({
      where: { userId: req.userId! },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    });
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}