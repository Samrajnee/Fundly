import { prisma } from "@fundly/database";

function isDue(frequency: string, lastPostedDate: Date | null, dueDay: number | null): boolean {
  const now = new Date();

  if (!lastPostedDate) return true; // never posted — due immediately

  const monthsSince =
    (now.getFullYear() - lastPostedDate.getFullYear()) * 12 + (now.getMonth() - lastPostedDate.getMonth());
  const daysSince = Math.floor((now.getTime() - lastPostedDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (frequency) {
    case "WEEKLY":
      return daysSince >= 7;
    case "MONTHLY":
      if (monthsSince < 1) return false;
      if (dueDay) return now.getDate() >= dueDay;
      return true;
    case "QUARTERLY":
      return monthsSince >= 3;
    case "YEARLY":
      return monthsSince >= 12;
    default:
      return false;
  }
}

export async function postDueRecurringExpenses(userId: string): Promise<number> {
  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { userId, isActive: true },
  });

  let postedCount = 0;

  for (const expense of recurringExpenses) {
    if (isDue(expense.frequency, expense.lastPostedDate, expense.dueDay)) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            userId,
            categoryId: expense.categoryId,
            amount: expense.amount,
            merchant: expense.label,
            note: `Auto-posted recurring expense`,
            date: new Date(),
            source: "RECURRING",
          },
        }),
        prisma.recurringExpense.update({
          where: { id: expense.id },
          data: { lastPostedDate: new Date() },
        }),
      ]);
      postedCount++;
    }
  }

  return postedCount;
}