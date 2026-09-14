import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



const defaultCategories = [
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

async function main() {
  await prisma.user.upsert({
    where: { id: req.userId! },
    update: {},
    create: {
      id: req.userId!,
      email: "test@fundly.dev",
      name: "Test User",
      passwordHash: "placeholder",
    },
  });

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: req.userId!, name: cat.name } },
      update: {},
      create: {
        userId: req.userId!,
        name: cat.name,
        type: cat.type,
        isDefault: true,
      },
    });
  }
  console.log("Seeded temp user and default categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });