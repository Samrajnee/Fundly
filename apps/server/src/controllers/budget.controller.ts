import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

const setBudgetSchema = z.object({
  categoryId: z.string().min(1),
  monthlyLimit: z.number().nonnegative(),
});

export async function setBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = setBudgetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId: { userId: TEMP_USER_ID, categoryId: parsed.data.categoryId },
      },
      update: { monthlyLimit: parsed.data.monthlyLimit },
      create: {
        userId: TEMP_USER_ID,
        categoryId: parsed.data.categoryId,
        monthlyLimit: parsed.data.monthlyLimit,
      },
    });

    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    next(err);
  }
}

export async function listBudgetProgress(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const budgets = await prisma.budget.findMany({
      where: { userId: TEMP_USER_ID },
      include: { category: true },
    });

    const progress = await Promise.all(
      budgets.map(async (budget) => {
        const spentResult = await prisma.transaction.aggregate({
          where: {
            userId: TEMP_USER_ID,
            categoryId: budget.categoryId,
            date: { gte: start, lt: end },
          },
          _sum: { amount: true },
        });

        const spent = Number(spentResult._sum.amount ?? 0);
        const monthlyLimit = Number(budget.monthlyLimit);
        const remaining = Math.max(monthlyLimit - spent, 0);
        const percentUsed = monthlyLimit > 0 ? Math.round((spent / monthlyLimit) * 100) : 0;

        return {
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          monthlyLimit,
          spent,
          remaining,
          percentUsed,
        };
      })
    );

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
}