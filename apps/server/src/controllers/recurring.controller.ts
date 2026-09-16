import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";



const createRecurringSchema = z.object({
  categoryId: z.string().min(1),
  label: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  dueDay: z.number().min(1).max(31).optional(),
});

export async function createRecurringExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createRecurringSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const recurring = await prisma.recurringExpense.create({
      data: { userId: req.userId!, ...parsed.data },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: recurring });
  } catch (err) {
    next(err);
  }
}

export async function listRecurringExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: { userId: req.userId!, isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: recurring });
  } catch (err) {
    next(err);
  }
}

export async function deactivateRecurringExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

const updateRecurringSchema = z.object({
  label: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  dueDay: z.number().min(1).max(31).optional(),
});

export async function updateRecurringExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateRecurringSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const recurring = await prisma.recurringExpense.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!recurring) {
      throw new AppError("Recurring expense not found", 404);
    }

    const updated = await prisma.recurringExpense.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}