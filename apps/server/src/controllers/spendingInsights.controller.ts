import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

export async function getSpendingInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const currentMonthTxns = await prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: start, lt: end } },
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

    // 6-month trend, broken down by category so each month's bar shows
    // where the money actually went, not just one flat total.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trendTxns = await prisma.transaction.findMany({
      where: { userId: req.userId!, date: { gte: sixMonthsAgo } },
      include: { category: true },
    });

    // Only chart the categories that actually appear, capped to the top 6
    // overall so the chart legend doesn't get unreadable.
    const categoryTotalsAllTime = new Map<string, number>();
    for (const t of trendTxns) {
      categoryTotalsAllTime.set(t.category.name, (categoryTotalsAllTime.get(t.category.name) ?? 0) + Number(t.amount));
    }
    const trendCategories = Array.from(categoryTotalsAllTime.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name]) => name);

    const monthlyByCategoryMap = new Map<string, Record<string, number>>();
    for (const t of trendTxns) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyByCategoryMap.has(key)) monthlyByCategoryMap.set(key, {});
      const bucket = monthlyByCategoryMap.get(key)!;
      const catName = trendCategories.includes(t.category.name) ? t.category.name : "Other";
      bucket[catName] = (bucket[catName] ?? 0) + Number(t.amount);
    }

    const sortedMonths = Array.from(monthlyByCategoryMap.keys()).sort();
    const monthlyTrend = sortedMonths.map((month) => {
      const bucket = monthlyByCategoryMap.get(month)!;
      const point: Record<string, string | number> = { month };
      for (const cat of trendCategories) {
        point[cat] = Math.round((bucket[cat] ?? 0) * 100) / 100;
      }
      if (bucket["Other"]) {
        point["Other"] = Math.round(bucket["Other"] * 100) / 100;
      }
      return point;
    });

    const finalTrendCategories = trendCategories.some((c) => monthlyTrend.some((p) => p["Other"]))
      ? [...trendCategories, "Other"]
      : trendCategories;

    const savingsTypeTxns = currentMonthTxns.filter((t) => t.category.type === "SAVINGS" || t.category.type === "INVESTMENT");
    const savingsAmount = savingsTypeTxns.reduce((sum, t) => sum + Number(t.amount), 0);
    const currentMonthSavingsRate = currentMonthTotalSpend > 0 ? Math.round((savingsAmount / currentMonthTotalSpend) * 10000) / 100 : 0;

    res.json({
      success: true,
      data: {
        topCategories,
        monthlyTrend,
        trendCategories: finalTrendCategories,
        currentMonthSavingsRate,
        currentMonthTotalSpend: Math.round(currentMonthTotalSpend * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
}