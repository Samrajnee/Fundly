import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "@fundly/database";
import { calculateMonthlyRequired } from "./goal.service";
import { AppError } from "../middlewares/errorHandler";
import type { AiGoalProposalDTO } from "@fundly/shared-types";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const goalExtractionTool = {
  name: "extract_goal",
  description: "Extract a structured financial goal from a natural language description.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Short goal name, e.g. 'Bike', 'Goa Trip'" },
      targetAmount: { type: "number", description: "Target amount as a plain number, no currency symbol" },
      monthsFromNow: { type: "number", description: "How many months from today the target date should be" },
    },
    required: ["name", "targetAmount", "monthsFromNow"],
  },
};

const goalExtractionSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  monthsFromNow: z.number().positive(),
});

export async function planGoalFromDescription(userId: string, description: string): Promise<AiGoalProposalDTO> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 300,
    tools: [goalExtractionTool],
    tool_choice: { type: "tool", name: "extract_goal" },
    messages: [
      {
        role: "user",
        content: `Extract the goal details from: "${description}". If no timeframe is mentioned, assume 12 months. Convert amounts like "1.5 lakh" to 150000.`,
      },
    ],
  });

  const toolUseBlock = message.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new AppError("Couldn't understand that goal description. Try rephrasing.", 422);
  }

  const parsed = goalExtractionSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    throw new AppError("Couldn't understand that goal description. Try rephrasing.", 422);
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + Math.round(parsed.data.monthsFromNow));

  // Deterministic math — not from Claude.
  const monthlyRequired = calculateMonthlyRequired(parsed.data.targetAmount, 0, targetDate);

  // Feasibility check against real data: compare required amount to current goalsAmount capacity.
  const activePlan = await prisma.salaryProfile.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const existingGoals = await prisma.goal.findMany({ where: { userId, status: "ACTIVE" } });
  const existingCommitment = existingGoals.reduce((sum, g) => sum + Number(g.monthlyRequired), 0);

  let feasible = true;
  let reasoning = `This goal needs ₹${monthlyRequired}/month to reach ₹${parsed.data.targetAmount} in ${Math.round(parsed.data.monthsFromNow)} months.`;

  if (activePlan) {
    const availableForGoals = Number(activePlan.goalsAmount);
    const totalNeeded = existingCommitment + monthlyRequired;
    feasible = totalNeeded <= availableForGoals * 1.5; // allow some headroom before flagging as unrealistic
    reasoning += feasible
      ? ` Your current plan allocates ₹${availableForGoals}/month to goals, which comfortably covers this alongside your existing goals.`
      : ` Your current plan only allocates ₹${availableForGoals}/month to goals, and you already need ₹${existingCommitment}/month for existing goals — this timeline may be tight. Consider a longer timeframe or increasing your goals allocation.`;
  } else {
    reasoning += " Create a Salary Plan first to check whether this timeline is realistic for your income.";
  }

  return {
    name: parsed.data.name,
    targetAmount: parsed.data.targetAmount,
    targetDate: targetDate.toISOString(),
    monthlyRequired,
    feasible,
    reasoning,
  };
}