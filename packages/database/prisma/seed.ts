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

const educationArticles = [
  {
    slug: "what-is-an-emergency-fund",
    title: "What Is an Emergency Fund?",
    category: "BASICS" as const,
    summary: "A safety net for unexpected expenses, so a surprise cost doesn't turn into debt.",
    content: "An emergency fund is money set aside specifically for unplanned expenses — a medical bill, a job loss, urgent travel, or a big repair. The general guideline is 3 to 6 months of your essential living expenses (rent, food, utilities, transport — not lifestyle spending). Keep it somewhere safe and easy to access, like a savings account or a liquid fund, not locked into long-term investments. The goal isn't growth, it's protection: this money exists so that when something goes wrong, you don't have to borrow at high interest or sell investments at a bad time.",
    readMinutes: 3,
  },
  {
    slug: "what-is-a-sip",
    title: "What Is a SIP?",
    category: "INVESTING" as const,
    summary: "A Systematic Investment Plan lets you invest a fixed amount regularly instead of all at once.",
    content: "A SIP (Systematic Investment Plan) is a way to invest a fixed amount into a mutual fund at regular intervals — usually monthly — instead of investing a lump sum. This does two things: it builds a saving habit automatically, and it averages out your purchase price over time (buying more units when prices are low, fewer when prices are high), which reduces the risk of investing everything right before a market dip. SIPs are popular for long-term goals like retirement or wealth building because they turn investing into a routine rather than a decision you have to make and time correctly every month.",
    readMinutes: 4,
  },
  {
    slug: "epf-vs-ppf-vs-nps",
    title: "EPF vs PPF vs NPS: What's the Difference?",
    category: "RETIREMENT" as const,
    summary: "Three common retirement savings options in India, and how they differ.",
    content: "EPF (Employees' Provident Fund) is a retirement savings scheme automatically deducted from salaried employees' pay, matched by their employer, with a government-set interest rate. PPF (Public Provident Fund) is a voluntary long-term savings scheme open to anyone, with a 15-year lock-in and tax-free returns, popular for self-employed individuals or as an addition to EPF. NPS (National Pension System) is a market-linked retirement scheme where your contributions are invested in a mix of equity and debt based on your choice, offering potentially higher returns but with market risk, and partial withdrawal is allowed at retirement while the rest converts to a pension annuity. In short: EPF is employer-driven and stable, PPF is voluntary and stable, NPS is market-linked with more growth potential and more risk.",
    readMinutes: 5,
  },
  {
    slug: "understanding-your-credit-score",
    title: "Understanding Your Credit Score",
    category: "DEBT" as const,
    summary: "What a credit score measures and why it matters even if you don't have loans yet.",
    content: "A credit score is a number, typically between 300 and 900, that represents how reliably you've repaid borrowed money in the past. It's calculated from your credit history: how many loans or credit cards you've had, whether you've paid on time, how much of your available credit you're using, and how long you've had credit accounts open. Lenders use it to decide whether to approve a loan or credit card, and at what interest rate. Even if you don't plan to borrow soon, building a good score early — by paying credit card bills in full and on time — makes future loans (like a home loan) cheaper and easier to get approved for.",
    readMinutes: 4,
  },
  {
    slug: "why-health-insurance-matters-early",
    title: "Why Get Health Insurance Early?",
    category: "INSURANCE" as const,
    summary: "Buying health cover while you're young and healthy is cheaper and simpler than waiting.",
    content: "Health insurance premiums are calculated partly based on age and health history — the younger and healthier you are when you buy a policy, the lower your premium, and the fewer pre-existing conditions you'll need to declare (which can otherwise mean waiting periods before certain treatments are covered). Many people delay buying health insurance because they feel healthy and it seems like an unnecessary expense, but a single major hospitalization without cover can wipe out years of savings. Getting even basic coverage early locks in a lower premium for years and ensures you're protected before you actually need it — insurance is meant to be bought before the risk shows up, not after.",
    readMinutes: 3,
  },
  {
    slug: "how-income-tax-slabs-work",
    title: "How Income Tax Slabs Work",
    category: "TAX" as const,
    summary: "Understanding why your whole salary isn't taxed at one flat rate.",
    content: "Income tax in a slab system doesn't tax your entire income at one rate — instead, different portions of your income are taxed at increasing rates. For example, if the first ₹3 lakh is tax-free, the next ₹3-6 lakh is taxed at 5%, and so on, then someone earning ₹8 lakh doesn't pay a flat rate on the whole ₹8 lakh — only the portion falling in each bracket is taxed at that bracket's rate. This means moving into a higher slab doesn't reduce your overall take-home as much as people sometimes fear, since only the incremental income is taxed at the higher rate. Exact slabs and rates change with each budget, so it's worth checking current rates when planning your taxes each year.",
    readMinutes: 4,
  },
];

async function seedEducationArticles() {
  for (const article of educationArticles) {
    await prisma.educationArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }
}

async function main() {
  await prisma.user.upsert({
    where: { id: TEMP_USER_ID },
    update: {},
    create: {
      id: TEMP_USER_ID,
      email: "test@fundly.dev",
      name: "Test User",
      passwordHash: "placeholder",
    },
  });

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

  await seedEducationArticles();

  console.log("Seeded temp user, default categories, and education articles.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });