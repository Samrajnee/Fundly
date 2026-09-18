import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@fundly/database";
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
} from "../validators/transaction.validator";
import { AppError } from "../middlewares/errorHandler";

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  merchant: z.string().optional(),
  note: z.string().optional(),
});

export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        merchant: parsed.data.merchant,
        note: parsed.data.note,
        date: new Date(parsed.data.date),
        source: "MANUAL",
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = listTransactionsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const { month, year, categoryId } = parsed.data;

    const where: Record<string, unknown> = {
      userId: req.userId!,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateTransactionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const existing = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!existing) {
      throw new AppError("Transaction not found", 404);
    }

    const updated = await prisma.transaction.update({
      where: {
        id: req.params.id,
      },
      data: parsed.data,
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!existing) {
      throw new AppError("Transaction not found", 404);
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      data: null,
    });
  } catch (err) {
    next(err);
  }
}