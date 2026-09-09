import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

const TEMP_USER_ID = "temp-user-id";

export async function getSpendingInsights(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Top categories this month
    const currentMonthTxns = await prisma.transaction.findMany({
      where: { userId: TEMP_USER_ID, date: { gte: start, lt: end } },
      include: { category: true },
    });

    const categoryTotals = new Map<string, number>();
    for (const t of currentMonthTxns) {
      categoryTotals.set(t.category.name, (categoryTotals.get(t.category.name) ?? 0) + Number(t.amount));
    }

    const currentMonthTotalSpend = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0);

    const topCategories = Array.from(categoryTotals.entries())
      .map(([categoryName, amount]) => ({
        categoryName,
        amount: Math.round(amount * 100) / 100,
        percentOfTotal: currentMonthTotalSpend > 0 ? Math.round((amount / currentMonthTotalSpend) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 6-month trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendTxns = await prisma.transaction.findMany({
      where: { userId: TEMP_USER_ID, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    });

    const monthlyTotals = new Map<string, number>();
    for (const t of trendTxns) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + Number(t.amount));
    }

    const sortedMonths = Array.from(monthlyTotals.entries()).sort(([a], [b]) => a.localeCompare(b));
    const monthlyTrend = sortedMonths.map(([month, amount], idx) => {
      const prevAmount = idx > 0 ? sortedMonths[idx - 1][1] : null;
      const changePercent = prevAmount && prevAmount > 0
        ? Math.round(((amount - prevAmount) / prevAmount) * 10000) / 100
        : null;
      return { month, amount: Math.round(amount * 100) / 100, changePercent };
    });

    // Savings rate this month (savings + investment categories vs total spend)
    const savingsTypeTxns = currentMonthTxns.filter(
      (t) => t.category.type === "SAVINGS" || t.category.type === "INVESTMENT"
    );
    const savingsAmount = savingsTypeTxns.reduce((sum, t) => sum + Number(t.amount), 0);
    const currentMonthSavingsRate = currentMonthTotalSpend > 0
      ? Math.round((savingsAmount / currentMonthTotalSpend) * 10000) / 100
      : 0;

    res.json({
      success: true,
      data: {
        topCategories,
        monthlyTrend,
        currentMonthSavingsRate,
        currentMonthTotalSpend: Math.round(currentMonthTotalSpend * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
}