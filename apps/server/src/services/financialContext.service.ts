import { prisma } from "@fundly/database";

export async function buildFinancialContextSummary(userId: string): Promise<string> {
  const [activePlan, goals, debts, investments, emergencyFund, recentTransactions] = await Promise.all([
    prisma.salaryProfile.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.goal.findMany({ where: { userId, status: "ACTIVE" } }),
    prisma.debt.findMany({ where: { userId } }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.emergencyFund.findUnique({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  const lines: string[] = [];

  if (activePlan) {
    lines.push(
      `Monthly salary: ₹${activePlan.monthlySalary}. Plan: necessities ₹${activePlan.necessitiesAmount}, lifestyle ₹${activePlan.lifestyleAmount}, savings ₹${activePlan.savingsAmount}, investments ₹${activePlan.investmentsAmount}, goals ₹${activePlan.goalsAmount}, buffer ₹${activePlan.bufferAmount}.`
    );
  } else {
    lines.push("No active salary plan yet.");
  }

  if (goals.length > 0) {
    lines.push(
      "Active goals: " +
        goals.map((g) => `${g.name} (₹${g.currentAmount}/₹${g.targetAmount}, needs ₹${g.monthlyRequired}/mo)`).join("; ")
    );
  } else {
    lines.push("No active financial goals.");
  }

  if (debts.length > 0) {
    lines.push(
      "Debts: " + debts.map((d) => `${d.lender} (${d.type}): ₹${d.outstandingAmount} outstanding, EMI ₹${d.emiAmount}`).join("; ")
    );
  } else {
    lines.push("No debts on record.");
  }

  if (investments.length > 0) {
    const total = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
    lines.push(`Investments total current value: ₹${total} across ${investments.length} holdings.`);
  } else {
    lines.push("No investments on record.");
  }

  lines.push(
    emergencyFund
      ? `Emergency fund: ₹${emergencyFund.currentAmount} saved (target ${emergencyFund.targetMonths} months of necessities).`
      : "No emergency fund started yet."
  );

  const totalRecentSpend = recentTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const byCategory = new Map<string, number>();
  for (const t of recentTransactions) {
    byCategory.set(t.category.name, (byCategory.get(t.category.name) ?? 0) + Number(t.amount));
  }
  const topCategories = Array.from(byCategory.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amt]) => `${name}: ₹${amt}`)
    .join(", ");

  lines.push(`Last 30 days spending: ₹${totalRecentSpend} total. Top categories: ${topCategories || "none"}.`);

  return lines.join("\n");
}