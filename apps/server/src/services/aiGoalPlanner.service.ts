import { callGeminiTool, SchemaType } from "./gemini.service";
import { z } from "zod";
import { prisma } from "@fundly/database";
import { calculateMonthlyRequired } from "./goal.service";
import { AppError } from "../middlewares/errorHandler";
import type { AiGoalProposalDTO } from "@fundly/shared-types";

const goalExtractionSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  monthsFromNow: z.number().positive(),
});

export async function planGoalFromDescription(userId: string, description: string): Promise<AiGoalProposalDTO> {
  let raw;
  try {
    raw = await callGeminiTool({
      functionName: "extract_goal",
      functionDescription: "Extract a structured financial goal from a natural language description.",
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Short goal name, e.g. Bike, Goa Trip" },
          targetAmount: { type: SchemaType.NUMBER, description: "Target amount as a plain number, no currency symbol" },
          monthsFromNow: { type: SchemaType.NUMBER, description: "How many months from today the target date should be" },
        },
        required: ["name", "targetAmount", "monthsFromNow"],
      },
      prompt: `Extract the goal details from: "${description}". If no timeframe is mentioned, assume 12 months. Convert amounts like "1.5 lakh" to 150000.`,
    });
  } catch {
    throw new AppError("Couldn't understand that goal description. Try rephrasing.", 422);
  }

  const parsed = goalExtractionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("Couldn't understand that goal description. Try rephrasing.", 422);
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + Math.round(parsed.data.monthsFromNow));

  const monthlyRequired = calculateMonthlyRequired(parsed.data.targetAmount, 0, targetDate);

  const activePlan = await prisma.salaryProfile.findFirst({ where: { userId, isActive: true }, orderBy: { createdAt: "desc" } });
  const existingGoals = await prisma.goal.findMany({ where: { userId, status: "ACTIVE" } });
  const existingCommitment = existingGoals.reduce((sum, g) => sum + Number(g.monthlyRequired), 0);

  let feasible = true;
  let reasoning = `This goal needs ${monthlyRequired}/month to reach ${parsed.data.targetAmount} in ${Math.round(parsed.data.monthsFromNow)} months.`;

  if (activePlan) {
    const availableForGoals = Number(activePlan.goalsAmount);
    const totalNeeded = existingCommitment + monthlyRequired;
    feasible = totalNeeded <= availableForGoals * 1.5;
    reasoning += feasible
      ? ` Your current plan allocates ${availableForGoals}/month to goals, which comfortably covers this alongside your existing goals.`
      : ` Your current plan only allocates ${availableForGoals}/month to goals, and you already need ${existingCommitment}/month for existing goals - this timeline may be tight. Consider a longer timeframe or increasing your goals allocation.`;
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