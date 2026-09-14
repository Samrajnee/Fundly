import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";



const updateSchema = z.object({
  targetMonths: z.number().min(1).max(24).optional(),
  contributionAmount: z.number().positive().optional(),
});

export async function getEmergencyFund(req: Request, res: Response, next: NextFunction) {
  try {
    const activePlan = await prisma.salaryProfile.findFirst({
      where: { userId: req.userId!, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!activePlan) {
      throw new AppError("No active salary plan found. Create one first.", 404);
    }

    let fund = await prisma.emergencyFund.findUnique({ where: { userId: req.userId! } });
    if (!fund) {
      fund = await prisma.emergencyFund.create({
        data: { userId: req.userId!, targetMonths: 6, currentAmount: 0 },
      });
    }

    const necessities = Number(activePlan.necessitiesAmount);
    const targetAmount = necessities * fund.targetMonths;
    const currentAmount = Number(fund.currentAmount);
    const percentComplete = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
    const monthsCovered = necessities > 0 ? Math.round((currentAmount / necessities) * 10) / 10 : 0;

    res.json({
      success: true,
      data: {
        targetMonths: fund.targetMonths,
        currentAmount,
        targetAmount: Math.round(targetAmount * 100) / 100,
        percentComplete,
        monthsCovered,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEmergencyFund(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    let fund = await prisma.emergencyFund.findUnique({ where: { userId: req.userId! } });
    if (!fund) {
      fund = await prisma.emergencyFund.create({
        data: { userId: req.userId!, targetMonths: 6, currentAmount: 0 },
      });
    }

    const updated = await prisma.emergencyFund.update({
      where: { userId: req.userId! },
      data: {
        targetMonths: parsed.data.targetMonths ?? fund.targetMonths,
        currentAmount: parsed.data.contributionAmount
          ? Number(fund.currentAmount) + parsed.data.contributionAmount
          : fund.currentAmount,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}