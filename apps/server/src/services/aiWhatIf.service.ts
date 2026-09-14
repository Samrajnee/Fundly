import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "@fundly/database";
import { calculateSalaryBreakdown } from "./salaryAllocation.service";
import { AppError } from "../middlewares/errorHandler";
import type { WhatIfResultDTO } from "@fundly/shared-types";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const whatIfTool = {
  name: "interpret_what_if",
  description: "Translate a hypothetical financial question into structured numeric deltas.",
  input_schema: {
    type: "object" as const,
    properties: {
      salaryDeltaAmount: { type: "number", description: "Change in monthly salary, 0 if not mentioned. Can be negative." },
      fixedExpenseDeltaAmount: { type: "number", description: "Change in fixed monthly expenses (e.g. new rent), 0 if not mentioned. Can be negative." },
      investmentDeltaAmount: { type: "number", description: "Change in monthly investment amount (e.g. SIP increase), 0 if not mentioned." },
      interpretation: { type: "string", description: "1 sentence restating what scenario is being tested" },
    },
    required: ["salaryDeltaAmount", "fixedExpenseDeltaAmount", "investmentDeltaAmount", "interpretation"],
  },
};

const whatIfResponseSchema = z.object({
  salaryDeltaAmount: z.number(),
  fixedExpenseDeltaAmount: z.number(),
  investmentDeltaAmount: z.number(),
  interpretation: z.string().min(1),
});

export async function simulateWhatIf(userId: string, question: string): Promise<WhatIfResultDTO> {
  const activePlan = await prisma.salaryProfile.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!activePlan) {
    throw new AppError("Create a Salary Plan first before running simulations.", 404);
  }

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 300,
    tools: [whatIfTool],
    tool_choice: { type: "tool", name: "interpret_what_if" },
    messages: [
      {
        role: "user",
        content: `Translate this hypothetical into numeric deltas: "${question}". Only set a field nonzero if the question actually implies that kind of change.`,
      },
    ],
  });

  const toolUseBlock = message.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new AppError("Couldn't understand that scenario. Try rephrasing.", 422);
  }

  const parsed = whatIfResponseSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    throw new AppError("Couldn't understand that scenario. Try rephrasing.", 422);
  }

  const current: import("@fundly/shared-types").SalaryBreakdown = {
    necessitiesAmount: Number(activePlan.necessitiesAmount),
    lifestyleAmount: Number(activePlan.lifestyleAmount),
    savingsAmount: Number(activePlan.savingsAmount),
    investmentsAmount: Number(activePlan.investmentsAmount),
    goalsAmount: Number(activePlan.goalsAmount),
    bufferAmount: Number(activePlan.bufferAmount),
  };

  // Deterministic recalculation — Claude only supplied the deltas above.
  const projectedSalary = Number(activePlan.monthlySalary) + parsed.data.salaryDeltaAmount;
  const projectedFixedExpenses = Number(activePlan.necessitiesAmount) + parsed.data.fixedExpenseDeltaAmount;

  const projectedBase = calculateSalaryBreakdown({
    monthlySalary: Math.max(projectedSalary, 0),
    livingSituation: activePlan.livingSituation,
    supportsFamily: activePlan.supportsFamily,
    fixedExpenses: Math.max(projectedFixedExpenses, 0),
  });

  // Apply investment delta by shifting from buffer first, then lifestyle, floored at 0.
  let projected = { ...projectedBase };
  let explanationNote = "";

  if (parsed.data.investmentDeltaAmount !== 0) {
    const delta = parsed.data.investmentDeltaAmount;
    let remainingDelta = delta;

    const bufferAvailable = projected.bufferAmount;
    const takenFromBuffer = Math.min(Math.max(remainingDelta, 0), bufferAvailable);
    projected.bufferAmount -= takenFromBuffer;
    remainingDelta -= takenFromBuffer;

    if (remainingDelta > 0) {
      const takenFromLifestyle = Math.min(remainingDelta, projected.lifestyleAmount);
      projected.lifestyleAmount -= takenFromLifestyle;
      remainingDelta -= takenFromLifestyle;
    }

    projected.investmentsAmount = Math.max(projected.investmentsAmount + delta - remainingDelta, 0);

    if (remainingDelta > 0.01) {
      explanationNote = ` Note: only ₹${Math.round((delta - remainingDelta) * 100) / 100} of the requested ₹${delta} investment increase could be accommodated without going negative elsewhere.`;
    }
  }

  const round2 = (n: number) => Math.round(n * 100) / 100;
  projected = {
    necessitiesAmount: round2(projected.necessitiesAmount),
    lifestyleAmount: round2(projected.lifestyleAmount),
    savingsAmount: round2(projected.savingsAmount),
    investmentsAmount: round2(projected.investmentsAmount),
    goalsAmount: round2(projected.goalsAmount),
    bufferAmount: round2(projected.bufferAmount),
  };

  const explanation =
    `Salary would ${parsed.data.salaryDeltaAmount >= 0 ? "increase" : "decrease"} by ₹${Math.abs(parsed.data.salaryDeltaAmount)} to ₹${projectedSalary}. ` +
    `Necessities would change by ₹${round2(projected.necessitiesAmount - current.necessitiesAmount)}, lifestyle by ₹${round2(projected.lifestyleAmount - current.lifestyleAmount)}, investments by ₹${round2(projected.investmentsAmount - current.investmentsAmount)}, buffer by ₹${round2(projected.bufferAmount - current.bufferAmount)}.` +
    explanationNote;

  return {
    interpretation: parsed.data.interpretation,
    current,
    projected,
    explanation,
  };
}