import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { createTransactionSchema, listTransactionsQuerySchema } from "../validators/transaction.validator";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: TEMP_USER_ID,
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        merchant: parsed.data.merchant,
        note: parsed.data.note,
        date: new Date(parsed.data.date),
        source: "MANUAL",
      },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function listTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listTransactionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const { month, year, categoryId } = parsed.data;
    const where: Record<string, unknown> = { userId: TEMP_USER_ID };

    if (categoryId) where.categoryId = categoryId;

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.date = { gte: start, lt: end };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}