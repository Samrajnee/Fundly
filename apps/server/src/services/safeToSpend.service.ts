import { prisma } from "@fundly/database";
import type { SafeToSpendDTO } from "@fundly/shared-types";
import { getAppToday } from "./appDate.service";

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function computeSafeToSpend(userId: string): Promise<SafeToSpendDTO | null> {
  const activePlan = await prisma.salaryProfile.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!activePlan) return null;

  const { year, month, day, daysInMonth } = getAppToday();

  // Transactions store calendar dates as UTC midnight, so all ranges use UTC.
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const todayStart = new Date(Date.UTC(year, month - 1, day));
  const todayEnd = new Date(Date.UTC(year, month - 1, day + 1));

  const [spentBeforeTodayResult, spentTodayResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, date: { gte: monthStart, lt: todayStart }, category: { type: "LIFESTYLE" } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, date: { gte: todayStart, lt: todayEnd }, category: { type: "LIFESTYLE" } },
      _sum: { amount: true },
    }),
  ]);

  const lifestylePool = Number(activePlan.lifestyleAmount) + Number(activePlan.bufferAmount);
  const spentBeforeToday = Number(spentBeforeTodayResult._sum.amount ?? 0);
  const spentToday = Number(spentTodayResult._sum.amount ?? 0);

  // "After today" is what the UI shows; the math spreads money across today plus those days.
  const daysAfterToday = daysInMonth - day;
  const daysIncludingToday = daysAfterToday + 1;

  const remainingAtStartOfToday = Math.max(lifestylePool - spentBeforeToday, 0);
  const todayTarget = remainingAtStartOfToday / daysIncludingToday;
  const remainingToday = todayTarget - spentToday;

  const remainingOverall = Math.max(lifestylePool - spentBeforeToday - spentToday, 0);
  const dailySafeAmount = remainingOverall / daysIncludingToday;
  const tomorrowProjectedTarget = daysAfterToday > 0 ? remainingOverall / daysAfterToday : null;

  return {
    dailySafeAmount: round2(dailySafeAmount),
    weeklySafeAmount: round2(dailySafeAmount * Math.min(7, daysIncludingToday)),
    lifestyleBudgetRemaining: round2(remainingOverall),
    daysAfterToday,
    todayTarget: round2(todayTarget),
    spentToday: round2(spentToday),
    remainingToday: round2(remainingToday),
    tomorrowProjectedTarget: tomorrowProjectedTarget !== null ? round2(tomorrowProjectedTarget) : null,
  };
}