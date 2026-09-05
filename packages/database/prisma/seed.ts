import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMP_USER_ID = "temp-user-id";

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
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: TEMP_USER_ID, name: cat.name } },
      update: {},
      create: {
        userId: TEMP_USER_ID,
        name: cat.name,
        type: cat.type,
        isDefault: true,
      },
    });
  }
  console.log("Seeded default categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });