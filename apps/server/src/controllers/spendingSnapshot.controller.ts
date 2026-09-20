import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

export async function createSpendingSnapshot(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const txns = await prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: start, lt: end } },
      include: { category: true },
    });

    if (txns.length === 0) {
      throw new AppError("No transactions logged yet this month to snapshot.", 422);
    }

    const categoryTotals = new Map<string, number>();
    for (const t of txns) {
      categoryTotals.set(t.category.name, (categoryTotals.get(t.category.name) ?? 0) + Number(t.amount));
    }
    const totalSpend = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0);

    const categoryBreakdown = Array.from(categoryTotals.entries()).map(([categoryName, amount]) => ({
      categoryName,
      amount: Math.round(amount * 100) / 100,
      percentOfTotal: totalSpend > 0 ? Math.round((amount / totalSpend) * 10000) / 100 : 0,
    }));

    const savingsAmount = txns
      .filter((t) => t.category.type === "SAVINGS" || t.category.type === "INVESTMENT")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const savingsRate = totalSpend > 0 ? Math.round((savingsAmount / totalSpend) * 10000) / 100 : 0;

    const snapshot = await prisma.spendingSnapshot.upsert({
      where: { userId_month_year: { userId: req.userId!, month, year } },
      update: { totalSpend, savingsRate, categoryBreakdown },
      create: { userId: req.userId!, month, year, totalSpend, savingsRate, categoryBreakdown },
    });

    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
}

export async function listSpendingSnapshots(req: Request, res: Response, next: NextFunction) {
  try {
    const snapshots = await prisma.spendingSnapshot.findMany({
      where: { userId: req.userId! },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    res.json({
      success: true,
      data: snapshots.map((s) => ({
        id: s.id,
        month: s.month,
        year: s.year,
        totalSpend: Number(s.totalSpend),
        savingsRate: Number(s.savingsRate),
        categoryBreakdown: s.categoryBreakdown,
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
}