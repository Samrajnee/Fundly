import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { salaryPlannerInputSchema } from "../validators/salary.validator";
import { calculateSalaryBreakdown } from "../services/salaryAllocation.service";
import { AppError } from "../middlewares/errorHandler";

// TEMPORARY: hardcoded until auth is built in a later phase
const TEMP_USER_ID = "temp-user-id";

export async function createSalaryPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = salaryPlannerInputSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const breakdown = calculateSalaryBreakdown(parsed.data);

    const profile = await prisma.salaryProfile.updateMany({
      where: { userId: TEMP_USER_ID, isActive: true },
      data: { isActive: false },
    });

    const saved = await prisma.salaryProfile.create({
      data: {
        userId: TEMP_USER_ID,
        monthlySalary: parsed.data.monthlySalary,
        necessitiesAmount: breakdown.necessitiesAmount,
        lifestyleAmount: breakdown.lifestyleAmount,
        savingsAmount: breakdown.savingsAmount,
        investmentsAmount: breakdown.investmentsAmount,
        goalsAmount: breakdown.goalsAmount,
        bufferAmount: breakdown.bufferAmount,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

export async function getActiveSalaryPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.salaryProfile.findFirst({
      where: { userId: TEMP_USER_ID, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!profile) {
      throw new AppError("No active salary plan found", 404);
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}