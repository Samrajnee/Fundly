import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";
import { calculateSalaryBreakdown } from "./salaryAllocation.service";
import type { SalaryBreakdownWithReasoning } from "@fundly/shared-types";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// The exact shape Claude must return - enforced via tool use, not free text.
const allocationToolSchema = {
  name: "propose_salary_allocation",
  description: "Propose a monthly salary allocation across six categories, as percentages of take-home pay.",
  input_schema: {
    type: "object" as const,
    properties: {
      necessitiesPercent: { type: "number", description: "0-100, share for rent/bills/food/transport" },
      lifestylePercent: { type: "number", description: "0-100, share for discretionary spending" },
      savingsPercent: { type: "number", description: "0-100, share for savings/emergency fund" },
      investmentsPercent: { type: "number", description: "0-100, share for investments" },
      goalsPercent: { type: "number", description: "0-100, share for specific financial goals" },
      bufferPercent: { type: "number", description: "0-100, small reserved cushion" },
      reasoning: { type: "string", description: "1-2 sentence plain-language explanation of this allocation" },
    },
    required: [
      "necessitiesPercent",
      "lifestylePercent",
      "savingsPercent",
      "investmentsPercent",
      "goalsPercent",
      "bufferPercent",
      "reasoning",
    ],
  },
};

const allocationResponseSchema = z.object({
  necessitiesPercent: z.number(),
  lifestylePercent: z.number(),
  savingsPercent: z.number(),
  investmentsPercent: z.number(),
  goalsPercent: z.number(),
  bufferPercent: z.number(),
  reasoning: z.string().min(1),
});

interface AiAllocationContext {
  monthlySalary: number;
  livingSituation: string;
  supportsFamily: boolean;
  fixedExpenses: number;
  incomeType: string;
  existingDebtEmiTotal: number;
  existingGoalsCount: number;
  hasEmergencyFund: boolean;
  isFirstSalary: boolean;
}

function validateAndClamp(
  raw: z.infer<typeof allocationResponseSchema>,
  context: AiAllocationContext
): SalaryBreakdownWithReasoning | null {
  const values = [
    raw.necessitiesPercent,
    raw.lifestylePercent,
    raw.savingsPercent,
    raw.investmentsPercent,
    raw.goalsPercent,
    raw.bufferPercent,
  ];

  // Reject outright nonsense before trying to salvage anything.
  if (values.some((v) => typeof v !== "number" || Number.isNaN(v) || v < 0 || v > 100)) {
    return null;
  }

  const sum = values.reduce((a, b) => a + b, 0);
  if (sum < 90 || sum > 110) {
    return null; // too far off 100% to trust - fall back to rule-based
  }

  // Normalize to exactly 100% regardless of minor drift.
  const scale = 100 / sum;
  const necessitiesPct = raw.necessitiesPercent * scale;
  const lifestylePct = raw.lifestylePercent * scale;
  const savingsPct = raw.savingsPercent * scale;
  const investmentsPct = raw.investmentsPercent * scale;
  const goalsPct = raw.goalsPercent * scale;
  const bufferPct = raw.bufferPercent * scale;

  const necessitiesAmount = Math.max(
    (context.monthlySalary * necessitiesPct) / 100,
    context.fixedExpenses
  );
  const remaining = Math.max(context.monthlySalary - necessitiesAmount, 0);
  const remainingWeightSum = lifestylePct + savingsPct + investmentsPct + goalsPct + bufferPct;

  if (remainingWeightSum <= 0) return null;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    necessitiesAmount: round2(necessitiesAmount),
    lifestyleAmount: round2(remaining * (lifestylePct / remainingWeightSum)),
    savingsAmount: round2(remaining * (savingsPct / remainingWeightSum)),
    investmentsAmount: round2(remaining * (investmentsPct / remainingWeightSum)),
    goalsAmount: round2(remaining * (goalsPct / remainingWeightSum)),
    bufferAmount: round2(remaining * (bufferPct / remainingWeightSum)),
    reasoning: raw.reasoning.slice(0, 500),
    source: "AI",
  };
}

export async function generateAiSalaryBreakdown(
  context: AiAllocationContext
): Promise<SalaryBreakdownWithReasoning> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      tools: [allocationToolSchema],
      tool_choice: { type: "tool", name: "propose_salary_allocation" },
      messages: [
        {
          role: "user",
          content: `Propose a monthly salary allocation for this person. Percentages must sum to 100.

Monthly salary: ₹${context.monthlySalary}
Living situation: ${context.livingSituation}
Supports family financially: ${context.supportsFamily}
Fixed monthly expenses: ₹${context.fixedExpenses}
Income type: ${context.incomeType}
Existing monthly debt EMIs: ₹${context.existingDebtEmiTotal}
Number of active financial goals: ${context.existingGoalsCount}
Has an emergency fund started: ${context.hasEmergencyFund}
Is this their first salary: ${context.isFirstSalary}

Consider: irregular income needs a bigger buffer; existing EMIs reduce what's free for lifestyle/investments; no emergency fund yet should weight savings higher; a first salary earner benefits from a simpler, more conservative split.`,
        },
      ],
    });

    const toolUseBlock = message.content.find((block) => block.type === "tool_use");
    if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
      throw new Error("No tool use block in response");
    }

    const parsed = allocationResponseSchema.safeParse(toolUseBlock.input);
    if (!parsed.success) {
      throw new Error("AI response failed schema validation");
    }

    const result = validateAndClamp(parsed.data, context);
    if (!result) {
      throw new Error("AI response failed sanity checks");
    }

    return result;
  } catch (err) {
    // Graceful degradation: any failure (API error, bad output, network issue)
    // falls back to the deterministic rule-based calculator from Phase 5/18.
    console.error("AI salary allocation failed, falling back to rule-based:", err);
    const fallback = calculateSalaryBreakdown({
      monthlySalary: context.monthlySalary,
      livingSituation: context.livingSituation as any,
      supportsFamily: context.supportsFamily,
      fixedExpenses: context.fixedExpenses,
      incomeType: context.incomeType as any,
    });
    return {
      ...fallback,
      reasoning: "Generated using our standard rule-based allocation (AI unavailable).",
      source: "RULE_BASED",
    };
  }
}