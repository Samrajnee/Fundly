import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { calculateMonthlyRequired } from "../services/goal.service";

const TEMP_USER_ID = "temp-user-id";

const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().min(1),
});

const contributeSchema = z.object({
  amount: z.number().positive(),
});

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const targetDate = new Date(parsed.data.targetDate);
    const monthlyRequired = calculateMonthlyRequired(parsed.data.targetAmount, 0, targetDate);

    const goal = await prisma.goal.create({
      data: {
        userId: TEMP_USER_ID,
        name: parsed.data.name,
        targetAmount: parsed.data.targetAmount,
        targetDate,
        monthlyRequired,
        currentAmount: 0,
        status: "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
}

export async function listGoals(_req: Request, res: Response, next: NextFunction) {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { targetDate: "asc" },
    });
    res.json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
}

export async function contributeToGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const parsed = contributeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal) {
      throw new AppError("Goal not found", 404);
    }

    const newCurrentAmount = Number(goal.currentAmount) + parsed.data.amount;
    const isCompleted = newCurrentAmount >= Number(goal.targetAmount);
    const monthlyRequired = isCompleted
      ? 0
      : calculateMonthlyRequired(Number(goal.targetAmount), newCurrentAmount, goal.targetDate);

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount,
        monthlyRequired,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}