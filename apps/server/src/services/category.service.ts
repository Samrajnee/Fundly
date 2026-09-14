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
  { name: "Emergency Fund", type: "SAVINGS" as const },
  { name: "General Savings", type: "SAVINGS" as const },
  { name: "SIP / Mutual Funds", type: "INVESTMENT" as const },
  { name: "Other Investments", type: "INVESTMENT" as const },
  { name: "Goal Contribution", type: "GOAL" as const },
];

export async function createDefaultCategoriesForUser(userId: string) {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_name: { userId, name: cat.name } },
      update: {},
      create: { userId, name: cat.name, type: cat.type, isDefault: true },
    });
  }
}