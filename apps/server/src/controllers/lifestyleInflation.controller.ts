import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

const TEMP_USER_ID = "temp-user-id";

export async function getLifestyleInflation(_req: Request, res: Response, next: NextFunction) {
  try {
    // Salary growth: compare the two most recent Salary Plans (current + previous).
    const salaryProfiles = await prisma.salaryProfile.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    let salaryGrowthPercent: number | null = null;
    if (salaryProfiles.length === 2) {
      const [latest, previous] = salaryProfiles;
      const prevSalary = Number(previous.monthlySalary);
      const latestSalary = Number(latest.monthlySalary);
      salaryGrowthPercent = prevSalary > 0
        ? Math.round(((latestSalary - prevSalary) / prevSalary) * 10000) / 100
        : null;
    }

    // Lifestyle spend trend: last 6 months of LIFESTYLE-category transactions.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: TEMP_USER_ID,
        date: { gte: sixMonthsAgo },
        category: { type: "LIFESTYLE" },
      },
      select: { amount: true, date: true },
    });

    const monthlyTotals = new Map<string, number>();
    for (const t of transactions) {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + Number(t.amount));
    }

    const monthlyLifestyleSpend = Array.from(monthlyTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));

    let lifestyleSpendGrowthPercent: number | null = null;
    if (monthlyLifestyleSpend.length >= 2) {
      const first = monthlyLifestyleSpend[0].amount;
      const last = monthlyLifestyleSpend[monthlyLifestyleSpend.length - 1].amount;
      lifestyleSpendGrowthPercent = first > 0 ? Math.round(((last - first) / first) * 10000) / 100 : null;
    }

    const hasEnoughData = salaryGrowthPercent !== null && lifestyleSpendGrowthPercent !== null;

    let verdict = "Not enough history yet — this improves as you track more months and update your salary plan over time.";
    if (hasEnoughData) {
      if (lifestyleSpendGrowthPercent! > salaryGrowthPercent!) {
        verdict = "Your lifestyle spending is growing faster than your salary — worth reining in.";
      } else {
        verdict = "Your lifestyle spending is growing in line with or slower than your salary. Good discipline.";
      }
    }

    res.json({
      success: true,
      data: {
        hasEnoughData,
        salaryGrowthPercent,
        lifestyleSpendGrowthPercent,
        verdict,
        monthlyLifestyleSpend,
      },
    });
  } catch (err) {
    next(err);
  }
}