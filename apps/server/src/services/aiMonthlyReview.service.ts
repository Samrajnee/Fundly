import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "@fundly/database";
import type { AIMonthlyReviewDTO } from "@fundly/shared-types";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const reviewTool = {
  name: "summarize_monthly_review",
  description: "Summarize a month's planned-vs-actual financial data into a short narrative.",
  input_schema: {
    type: "object" as const,
    properties: {
      summary: { type: "string", description: "2-3 sentence overview of how the month went" },
      highlights: { type: "array", items: { type: "string" }, description: "1-3 short positive callouts, based only on the data given" },
      areasToImprove: { type: "array", items: { type: "string" }, description: "1-3 short specific suggestions, based only on the data given" },
    },
    required: ["summary", "highlights", "areasToImprove"],
  },
};

const reviewResponseSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()),
  areasToImprove: z.array(z.string()),
});

export async function generateAiMonthlyReview(userId: string): Promise<AIMonthlyReviewDTO> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const plan = await prisma.monthlyPlan.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  if (!plan) {
    return {
      summary: "No monthly plan found yet for this month. Visit Monthly Plan to generate one first.",
      highlights: [],
      areasToImprove: [],
      source: "UNAVAILABLE",
    };
  }

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
Necessities — planned ₹${plan.necessitiesTarget}, actual ₹${actualByType.NECESSITY}
Lifestyle — planned ₹${plan.lifestyleTarget}, actual ₹${actualByType.LIFESTYLE}
Savings — planned ₹${plan.savingsTarget}, actual ₹${actualByType.SAVINGS}
Investments — planned ₹${plan.investmentsTarget}, actual ₹${actualByType.INVESTMENT}
Goals — planned ₹${plan.goalsTarget}, actual ₹${actualByType.GOAL}`.trim();

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      tools: [reviewTool],
      tool_choice: { type: "tool", name: "summarize_monthly_review" },
      messages: [
        {
          role: "user",
          content: `Here is this month's planned vs actual spending data:\n\n${dataSummary}\n\nSummarize this month. Use only the numbers given — don't invent anything not in this data.`,
        },
      ],
    });

    const toolUseBlock = message.content.find((b) => b.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") throw new Error("No tool use block");

    const parsed = reviewResponseSchema.safeParse(toolUseBlock.input);
    if (!parsed.success) throw new Error("Schema validation failed");

    return { ...parsed.data, source: "AI" };
  } catch (err) {
    console.error("AI monthly review failed:", err);
    return {
      summary: `This month: necessities ₹${actualByType.NECESSITY} of ₹${plan.necessitiesTarget} planned, lifestyle ₹${actualByType.LIFESTYLE} of ₹${plan.lifestyleTarget} planned.`,
      highlights: [],
      areasToImprove: [],
      source: "UNAVAILABLE",
    };
  }
}