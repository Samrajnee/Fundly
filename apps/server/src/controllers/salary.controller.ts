import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { salaryPlannerInputSchema } from "../validators/salary.validator";
import { generateAiSalaryBreakdown } from "../services/aiSalaryAllocation.service";
import { AppError } from "../middlewares/errorHandler";

export async function createSalaryPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = salaryPlannerInputSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const [debts, goalsCount, emergencyFund] = await Promise.all([
      prisma.debt.findMany({ where: { userId: req.userId! } }),
      prisma.goal.count({ where: { userId: req.userId!, status: "ACTIVE" } }),
      prisma.emergencyFund.findUnique({ where: { userId: req.userId! } }),
    ]);

    const existingDebtEmiTotal = debts.reduce((sum, d) => sum + Number(d.emiAmount), 0);

    const breakdown = await generateAiSalaryBreakdown({
      monthlySalary: parsed.data.monthlySalary,
      livingSituation: parsed.data.livingSituation,
      supportsFamily: parsed.data.supportsFamily,
      fixedExpenses: parsed.data.fixedExpenses,
      incomeType: user.incomeType,
      existingDebtEmiTotal,
      existingGoalsCount: goalsCount,
      hasEmergencyFund: !!emergencyFund && Number(emergencyFund.currentAmount) > 0,
      isFirstSalary: user.isFirstSalary,
    });

    await prisma.salaryProfile.updateMany({
      where: { userId: req.userId!, isActive: true },
      data: { isActive: false },
    });

    const saved = await prisma.salaryProfile.create({
      data: {
        userId: req.userId!,
        monthlySalary: parsed.data.monthlySalary,
        livingSituation: parsed.data.livingSituation,
        supportsFamily: parsed.data.supportsFamily,
        necessitiesAmount: breakdown.necessitiesAmount,
        lifestyleAmount: breakdown.lifestyleAmount,
        savingsAmount: breakdown.savingsAmount,
        investmentsAmount: breakdown.investmentsAmount,
        goalsAmount: breakdown.goalsAmount,
        bufferAmount: breakdown.bufferAmount,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { ...saved, reasoning: breakdown.reasoning, source: breakdown.source },
    });
  } catch (err) {
    next(err);
  }
}

export async function getActiveSalaryPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await prisma.salaryProfile.findFirst({
      where: { userId: req.userId!, isActive: true },
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