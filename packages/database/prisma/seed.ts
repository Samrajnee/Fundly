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
    slug: "necessities-vs-lifestyle",
    title: "Necessities vs Lifestyle: What's the Difference?",
    category: "BASICS" as const,
    summary: "Why Fundly treats rent and groceries differently from dining out and subscriptions.",
    content: "Necessities are the spending you can't reasonably avoid without real hardship: rent, groceries, utilities, and transport to work. If you stopped paying these, your basic living situation would break down within weeks. Lifestyle spending is everything discretionary - dining out, entertainment, shopping, subscriptions. If you cut this to zero for a month, it would be uncomfortable, but nothing would collapse. The distinction matters because it's the first split Fundly makes when building your salary plan: necessities get funded first and are treated as fixed, while lifestyle spending is the flexible portion that can expand or shrink based on what's left. This is also why Safe-to-Spend only tracks lifestyle spending against your daily budget - necessities are assumed to happen regardless, so they don't compete with your day-to-day spending money the way lifestyle purchases do.",
    readMinutes: 3,
  },
  {
    slug: "how-salary-planner-works",
    title: "How the Salary Planner Actually Works",
    category: "BASICS" as const,
    summary: "The order Fundly allocates your salary in, and why necessities come first.",
    content: "When you enter your salary, Fundly doesn't split it into six equal-feeling categories at once. It works in two steps. First, it sets aside your Necessities amount - this is whichever is larger: a percentage of your salary based on your living situation, or your actual stated fixed expenses, whichever protects you more. This ensures your rent and bills are always covered even if the percentage alone wouldn't have been enough. Second, whatever salary remains after necessities is split proportionally across Lifestyle, Savings, Investments, Goals, and Buffer, based on weights that adjust to your situation - for example, someone living with parents gets a larger share directed toward savings and investments, since they likely have lower fixed costs, while someone with irregular income gets a larger buffer instead. This two-step order is why increasing your fixed expenses (like moving to a costlier home) doesn't just come out of one category - it reshapes how the remaining money splits across everything else, since the pool available for the rest shrinks.",
    readMinutes: 4,
  },
  {
    slug: "what-is-the-buffer",
    title: "What Is the Buffer Category For?",
    category: "BASICS" as const,
    summary: "The small cushion in your plan that exists for the unexpected.",
    content: "The Buffer is a deliberately small slice of your monthly plan, separate from Savings, Investments, and Goals. Its purpose is different from all three: it's not for a specific target, it's a shock absorber for the small unplanned costs that don't fit any other category - a slightly higher electricity bill, an unplanned taxi ride, a gift you didn't budget for. Without a buffer, small surprises would either force you to dip into planned savings or overspend your lifestyle budget for the month. Fundly sizes the buffer based on your living situation and income stability - someone with irregular income gets a larger buffer than someone on a fixed salary, since irregular income carries more month-to-month uncertainty. If your buffer keeps running out every month, it's usually a sign that some recurring cost is missing from your Recurring Expenses list rather than genuinely being unpredictable.",
    readMinutes: 2,
  },
  {
    slug: "how-net-worth-is-calculated",
    title: "How Your Net Worth Is Calculated",
    category: "BASICS" as const,
    summary: "What counts as an asset, what counts as a liability, and why the number can be negative.",
    content: "Net worth is a single number: everything you own of financial value, minus everything you owe. In Fundly, the assets side adds up your investments' current value, your emergency fund balance, and the money saved toward your active goals. The liabilities side adds up the outstanding balance on every debt you've logged - loans, credit cards, EMIs. Net worth is simply assets minus liabilities. It's normal, especially early in your financial life, for this number to be low or even negative - a fresh graduate with an education loan and no investments yet will have negative net worth, and that's not a failure, it's a starting point. What matters more than the number itself is its direction over time: whether it's trending up as you pay down debt and build savings, which is exactly why Fundly lets you save monthly snapshots to track that trend rather than just showing today's figure in isolation.",
    readMinutes: 3,
  },
  {
    slug: "how-financial-health-score-works",
    title: "How the Financial Health Score Works",
    category: "BASICS" as const,
    summary: "The four things Fundly checks to calculate your score out of 100.",
    content: "Your Financial Health Score is built from four equally-weighted components, each scored out of 25. Savings Rate measures what share of your salary goes to savings and investments combined, with 20% or more earning full marks. Debt-to-Income Ratio measures your total monthly EMI payments against your salary, with anything under 20% considered healthy and anything approaching 40% scoring poorly. Insurance Coverage checks whether you have both health and life insurance on record, since missing either represents real financial risk if something goes wrong. Goal Progress measures how close your active goals are to being funded on schedule. These four add up to your total score out of 100. The score is intentionally simple and rule-based rather than a black box, so you can always see which specific area is pulling your score down and what concrete action would improve it, rather than getting a number with no explanation attached.",
    readMinutes: 3,
  },
  {
    slug: "how-fundly-fits-together",
    title: "How All of Fundly Fits Together",
    category: "BASICS" as const,
    summary: "A short tour of how your Salary Plan connects to everything else in the app.",
    content: "Everything in Fundly flows from one place: your active Salary Plan. Once it exists, it becomes the reference point the rest of the app measures against. Safe-to-Spend compares your daily lifestyle spending against your plan's Lifestyle and Buffer allocation, recalculating every day based on what's left in the month. Budget Progress compares category-specific limits you set against actual spending logged in Expense Tracker. Monthly Plan takes a snapshot of your active Salary Plan at the start of each month, so your targets for that month stay fixed even if you update your Salary Plan partway through - Monthly Review then compares what actually happened against that locked snapshot. Emergency Fund and Goals draw their targets from your Necessities and Goals allocations respectively. Financial Health Score and Net Worth pull from everything at once - your plan, your debts, your investments, your insurance, your goals - to give you one combined read on where you stand. The underlying idea is that you set your plan once, adjust it when your life actually changes, and everything downstream stays consistent with it automatically rather than needing to be maintained separately.",
    readMinutes: 4,
  },

  {
    slug: "what-is-an-emergency-fund",
    title: "What Is an Emergency Fund?",
    category: "BASICS" as const,
    summary: "A safety net for unexpected expenses, so a surprise cost doesn't turn into debt.",
    content: "An emergency fund is money set aside specifically for unplanned expenses - a medical bill, a job loss, urgent travel, or a big repair. The general guideline is 3 to 6 months of your essential living expenses (rent, food, utilities, transport - not lifestyle spending). Keep it somewhere safe and easy to access, like a savings account or a liquid fund, not locked into long-term investments. The goal isn't growth, it's protection: this money exists so that when something goes wrong, you don't have to borrow at high interest or sell investments at a bad time.",
    readMinutes: 3,
  },
  {
    slug: "what-is-a-sip",
    title: "What Is a SIP?",
    category: "INVESTING" as const,
    summary: "A Systematic Investment Plan lets you invest a fixed amount regularly instead of all at once.",
    content: "A SIP (Systematic Investment Plan) is a way to invest a fixed amount into a mutual fund at regular intervals - usually monthly - instead of investing a lump sum. This does two things: it builds a saving habit automatically, and it averages out your purchase price over time (buying more units when prices are low, fewer when prices are high), which reduces the risk of investing everything right before a market dip. SIPs are popular for long-term goals like retirement or wealth building because they turn investing into a routine rather than a decision you have to make and time correctly every month.",
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
    content: "A credit score is a number, typically between 300 and 900, that represents how reliably you've repaid borrowed money in the past. It's calculated from your credit history: how many loans or credit cards you've had, whether you've paid on time, how much of your available credit you're using, and how long you've had credit accounts open. Lenders use it to decide whether to approve a loan or credit card, and at what interest rate. Even if you don't plan to borrow soon, building a good score early - by paying credit card bills in full and on time - makes future loans (like a home loan) cheaper and easier to get approved for.",
    readMinutes: 4,
  },
  {
    slug: "why-health-insurance-matters-early",
    title: "Why Get Health Insurance Early?",
    category: "INSURANCE" as const,
    summary: "Buying health cover while you're young and healthy is cheaper and simpler than waiting.",
    content: "Health insurance premiums are calculated partly based on age and health history - the younger and healthier you are when you buy a policy, the lower your premium, and the fewer pre-existing conditions you'll need to declare (which can otherwise mean waiting periods before certain treatments are covered). Many people delay buying health insurance because they feel healthy and it seems like an unnecessary expense, but a single major hospitalization without cover can wipe out years of savings. Getting even basic coverage early locks in a lower premium for years and ensures you're protected before you actually need it - insurance is meant to be bought before the risk shows up, not after.",
    readMinutes: 3,
  },
  {
    slug: "how-income-tax-slabs-work",
    title: "How Income Tax Slabs Work",
    category: "TAX" as const,
    summary: "Understanding why your whole salary isn't taxed at one flat rate.",
    content: "Income tax in a slab system doesn't tax your entire income at one rate - instead, different portions of your income are taxed at increasing rates. For example, if the first ₹3 lakh is tax-free, the next ₹3-6 lakh is taxed at 5%, and so on, then someone earning ₹8 lakh doesn't pay a flat rate on the whole ₹8 lakh - only the portion falling in each bracket is taxed at that bracket's rate. This means moving into a higher slab doesn't reduce your overall take-home as much as people sometimes fear, since only the incremental income is taxed at the higher rate. Exact slabs and rates change with each budget, so it's worth checking current rates when planning your taxes each year.",
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