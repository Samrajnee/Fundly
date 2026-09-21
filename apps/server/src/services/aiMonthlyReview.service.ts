import { callGeminiTool, SchemaType } from "./gemini.service";
import { z } from "zod";
import { prisma } from "@fundly/database";
import type { AIMonthlyReviewDTO } from "@fundly/shared-types";

const reviewResponseSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()),
  areasToImprove: z.array(z.string()),
});

async function generateFresh(userId: string, month: number, year: number): Promise<AIMonthlyReviewDTO | null> {
  const plan = await prisma.monthlyPlan.findUnique({ where: { userId_month_year: { userId, month, year } } });
  if (!plan) return null;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const spendByType = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({ where: { userId } });
  const categoryTypeMap = new Map(categories.map((c) => [c.id, c.type]));

  const actualByType: Record<string, number> = { NECESSITY: 0, LIFESTYLE: 0, SAVINGS: 0, INVESTMENT: 0, GOAL: 0 };
  for (const row of spendByType) {
    const type = categoryTypeMap.get(row.categoryId);
    if (type) actualByType[type] += Number(row._sum.amount ?? 0);
  }

  const dataSummary = `
Necessities - planned Rs ${plan.necessitiesTarget}, actual Rs ${actualByType.NECESSITY}
Lifestyle - planned Rs ${plan.lifestyleTarget}, actual Rs ${actualByType.LIFESTYLE}
Savings - planned Rs ${plan.savingsTarget}, actual Rs ${actualByType.SAVINGS}
Investments - planned Rs ${plan.investmentsTarget}, actual Rs ${actualByType.INVESTMENT}
Goals - planned Rs ${plan.goalsTarget}, actual Rs ${actualByType.GOAL}`.trim();

  try {
    const raw = await callGeminiTool({
      functionName: "summarize_monthly_review",
      functionDescription: "Summarize a month's planned-vs-actual financial data into a short narrative.",
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING, description: "2-3 sentence overview of how the month went" },
          highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "1-3 short positive callouts, based only on the data given" },
          areasToImprove: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "1-3 short specific suggestions, based only on the data given" },
        },
        required: ["summary", "highlights", "areasToImprove"],
      },
      prompt: `Here is this month's planned vs actual spending data, all amounts in Indian Rupees (Rs):\n\n${dataSummary}\n\nSummarize this month. Always refer to amounts using "Rs" as the currency, never dollars or the $ symbol. Use only the numbers given, don't invent anything not in this data.`,
    });

    const parsed = reviewResponseSchema.safeParse(raw);
    if (!parsed.success) throw new Error("Schema validation failed");

    return { ...parsed.data, source: "AI" };
  } catch (err) {
    console.error("AI monthly review generation failed:", err);
    return {
      summary: `This month: necessities Rs ${actualByType.NECESSITY} of Rs ${plan.necessitiesTarget} planned, lifestyle Rs ${actualByType.LIFESTYLE} of Rs ${plan.lifestyleTarget} planned.`,
      highlights: [],
      areasToImprove: [],
      source: "UNAVAILABLE",
    };
  }
}

export async function generateAiMonthlyReview(userId: string, forceRefresh = false): Promise<AIMonthlyReviewDTO> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (!forceRefresh) {
    const cached = await prisma.aiMonthlyReviewCache.findUnique({ where: { userId_month_year: { userId, month, year } } });
    if (cached) {
      return {
        summary: cached.summary,
        highlights: cached.highlights as string[],
        areasToImprove: cached.areasToImprove as string[],
        source: cached.source as "AI" | "UNAVAILABLE",
      };
    }
  }

  const fresh = await generateFresh(userId, month, year);
  if (!fresh) {
    return {
      summary: "No monthly plan found yet for this month. Visit Monthly Plan to generate one first.",
      highlights: [],
      areasToImprove: [],
      source: "UNAVAILABLE",
    };
  }

  await prisma.aiMonthlyReviewCache.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: { summary: fresh.summary, highlights: fresh.highlights, areasToImprove: fresh.areasToImprove, source: fresh.source },
    create: { userId, month, year, summary: fresh.summary, highlights: fresh.highlights, areasToImprove: fresh.areasToImprove, source: fresh.source },
  });

  return fresh;
}