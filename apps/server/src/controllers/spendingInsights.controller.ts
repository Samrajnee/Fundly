import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function dayKeyUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function getSpendingInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const currentMonthTxns = await prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: start, lt: end } },
      include: { category: true },
    });

    // This month overall, by category
    const categoryTotals = new Map<string, number>();
    for (const t of currentMonthTxns) {
      categoryTotals.set(t.category.name, (categoryTotals.get(t.category.name) ?? 0) + Number(t.amount));
    }
    const currentMonthTotalSpend = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0);
    const topCategories = Array.from(categoryTotals.entries())
      .map(([categoryName, amount]) => ({
        categoryName,
        amount: round2(amount),
        percentOfTotal: currentMonthTotalSpend > 0 ? round2((amount / currentMonthTotalSpend) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Today only, by category - bucket every transaction by its stored
    // calendar date, then compare against today's own calendar date the
    // same way, so both sides use the identical convention.
    const todayKey = dayKeyUTC(now);
    const todayTxns = currentMonthTxns.filter((t) => dayKeyUTC(t.date) === todayKey);

    const todayCategoryTotals = new Map<string, number>();
    for (const t of todayTxns) {
      todayCategoryTotals.set(t.category.name, (todayCategoryTotals.get(t.category.name) ?? 0) + Number(t.amount));
    }
    const todayTotalSpend = Array.from(todayCategoryTotals.values()).reduce((a, b) => a + b, 0);
    const todayCategories = Array.from(todayCategoryTotals.entries())
      .map(([categoryName, amount]) => ({
        categoryName,
        amount: round2(amount),
        percentOfTotal: todayTotalSpend > 0 ? round2((amount / todayTotalSpend) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Per-day dominant category
    const perDayCategoryTotals = new Map<string, Map<string, number>>();
    for (const t of currentMonthTxns) {
      const dateKey = dayKeyUTC(t.date);
      if (!perDayCategoryTotals.has(dateKey)) perDayCategoryTotals.set(dateKey, new Map());
      const bucket = perDayCategoryTotals.get(dateKey)!;
      bucket.set(t.category.name, (bucket.get(t.category.name) ?? 0) + Number(t.amount));
    }

    const dailyTopCategories = Array.from(perDayCategoryTotals.entries())
      .map(([date, catMap]) => {
        let topCat = "";
        let topAmt = 0;
        for (const [cat, amt] of catMap.entries()) {
          if (amt > topAmt) {
            topCat = cat;
            topAmt = amt;
          }
        }
        return { date, categoryName: topCat, amount: round2(topAmt) };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    const savingsTypeTxns = currentMonthTxns.filter((t) => t.category.type === "SAVINGS" || t.category.type === "INVESTMENT");
    const savingsAmount = savingsTypeTxns.reduce((sum, t) => sum + Number(t.amount), 0);
    const currentMonthSavingsRate = currentMonthTotalSpend > 0 ? round2((savingsAmount / currentMonthTotalSpend) * 100) : 0;

    res.json({
      success: true,
      data: {
        topCategories,
        todayCategories,
        dailyTopCategories,
        currentMonthSavingsRate,
        currentMonthTotalSpend: round2(currentMonthTotalSpend),
        todayTotalSpend: round2(todayTotalSpend),
        month,
        year,
      },
    });
  } catch (err) {
    next(err);
  }
}