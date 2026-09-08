import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { calculateSalaryBreakdown } from "../services/salaryAllocation.service";

const TEMP_USER_ID = "temp-user-id";

const incrementSchema = z.object({
  newMonthlySalary: z.number().positive(),
});

export async function simulateSalaryIncrement(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = incrementSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: TEMP_USER_ID, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!activePlan) {
      throw new AppError("No active salary plan found. Create one first.", 404);
    }

    const currentSalary = Number(activePlan.monthlySalary);

    const current = {
      necessitiesAmount: Number(activePlan.necessitiesAmount),
      lifestyleAmount: Number(activePlan.lifestyleAmount),
      savingsAmount: Number(activePlan.savingsAmount),
      investmentsAmount: Number(activePlan.investmentsAmount),
      goalsAmount: Number(activePlan.goalsAmount),
      bufferAmount: Number(activePlan.bufferAmount),
    };

    const projected = calculateSalaryBreakdown({
      monthlySalary: parsed.data.newMonthlySalary,
      livingSituation: activePlan.livingSituation,
      supportsFamily: activePlan.supportsFamily,
      fixedExpenses: Number(activePlan.necessitiesAmount),
    });

    const increaseAmount = parsed.data.newMonthlySalary - currentSalary;
    const increasePercent = currentSalary > 0 ? Math.round((increaseAmount / currentSalary) * 10000) / 100 : 0;

    res.json({
      success: true,
      data: {
        current,
        projected,
        currentSalary,
        projectedSalary: parsed.data.newMonthlySalary,
        increaseAmount: Math.round(increaseAmount * 100) / 100,
        increasePercent,
      },
    });
  } catch (err) {
    next(err);
  }
}