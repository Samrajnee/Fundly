import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "../config/env";
import { AppError } from "../middlewares/errorHandler";

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const parseExpenseTool = {
  name: "extract_expense",
  description: "Extract structured expense details from a natural language description.",
  input_schema: {
    type: "object" as const,
    properties: {
      amount: { type: "number", description: "The expense amount as a plain number, no currency symbol" },
      merchant: { type: ["string", "null"], description: "Merchant or place name if mentioned, else null" },
      date: { type: "string", description: "ISO date (YYYY-MM-DD) the expense occurred on" },
      suggestedCategoryName: { type: "string", description: "Best matching category name from the provided list" },
      confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"], description: "How confident the extraction is" },
    },
    required: ["amount", "date", "suggestedCategoryName", "confidence"],
  },
};

const parseExpenseResponseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().nullable().optional(),
  date: z.string().min(1),
  suggestedCategoryName: z.string().min(1),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export async function parseExpenseText(text: string, categoryNames: string[]) {
  const today = new Date().toISOString().slice(0, 10);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 300,
    tools: [parseExpenseTool],
    tool_choice: { type: "tool", name: "extract_expense" },
    messages: [
      {
        role: "user",
        content: `Today's date is ${today}. Available categories: ${categoryNames.join(", ")}.

Extract the expense details from this text: "${text}"

Pick suggestedCategoryName from the available categories list exactly as written. If the text doesn't clearly describe a single expense, set confidence to LOW.`,
      },
    ],
  });

  const toolUseBlock = message.content.find((block) => block.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new AppError("Could not parse expense from that text. Try rephrasing.", 422);
  }

  const parsed = parseExpenseResponseSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    throw new AppError("Could not parse expense from that text. Try rephrasing.", 422);
  }

  // Validate the date is a real, parseable date - reject garbage before it hits the DB.
  const parsedDate = new Date(parsed.data.date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError("Could not determine a valid date from that text.", 422);
  }

  return {
    amount: parsed.data.amount,
    merchant: parsed.data.merchant ?? null,
    date: parsed.data.date,
    suggestedCategoryName: parsed.data.suggestedCategoryName,
    confidence: parsed.data.confidence,
  };
}