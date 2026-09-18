import { prisma } from "@fundly/database";

const DEFAULT_CATEGORIES = [
  { name: "Rent", type: "NECESSITY" as const },
  { name: "Groceries", type: "NECESSITY" as const },
  { name: "Utilities", type: "NECESSITY" as const },
  { name: "Transport", type: "NECESSITY" as const },
  { name: "Dining Out", type: "LIFESTYLE" as const },
  { name: "Entertainment", type: "LIFESTYLE" as const },
  { name: "Shopping", type: "LIFESTYLE" as const },
  { name: "Subscriptions", type: "LIFESTYLE" as const },
  { name: "Miscellaneous", type: "LIFESTYLE" as const },
  { name: "Emergency Fund", type: "SAVINGS" as const },
  { name: "General Savings", type: "SAVINGS" as const },
  { name: "SIP / Mutual Funds", type: "INVESTMENT" as const },
  { name: "Other Investments", type: "INVESTMENT" as const },
  { name: "Goal Contribution", type: "GOAL" as const },
];

export async function createDefaultCategoriesForUser(userId: string) {
  const existing = await prisma.category.findMany({
    where: { userId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));
  const missing = DEFAULT_CATEGORIES.filter((c) => !existingNames.has(c.name));

  if (missing.length === 0) return;

  await prisma.category.createMany({
    data: missing.map((c) => ({ userId, name: c.name, type: c.type, isDefault: true })),
  });
}