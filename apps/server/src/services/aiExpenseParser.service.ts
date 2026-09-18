import { callGeminiTool, SchemaType } from "./gemini.service";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const parseExpenseResponseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().nullable().optional(),
  date: z.string().min(1),
  suggestedCategoryName: z.string().min(1),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export async function parseExpenseText(text: string, categoryNames: string[]) {
  const today = new Date().toISOString().slice(0, 10);

  let raw;
  try {
    raw = await callGeminiTool({
      functionName: "extract_expense",
      functionDescription: "Extract structured expense details from a natural language description.",
      schema: {
        type: SchemaType.OBJECT,
        properties: {
          amount: { type: SchemaType.NUMBER, description: "The expense amount as a plain number" },
          merchant: { type: SchemaType.STRING, description: "Merchant or place name if mentioned, otherwise omit this field entirely" },
          date: { type: SchemaType.STRING, description: "ISO date (YYYY-MM-DD) the expense occurred on" },
          suggestedCategoryName: { type: SchemaType.STRING, description: "Best matching category name from the provided list, copied exactly" },
          confidence: { type: SchemaType.STRING, format: "enum", enum: ["HIGH", "MEDIUM", "LOW"], description: "How confident the category match is" },
        },
        required: ["amount", "date", "suggestedCategoryName", "confidence"],
      },
      prompt: `Today's date is ${today}. Available categories: ${categoryNames.join(", ")}.

Extract the expense details from this text: "${text}"

Pick suggestedCategoryName from the available categories list exactly as written. If nothing fits well, use "Miscellaneous" if it's in the list. If the text doesn't clearly describe a single expense, set confidence to LOW.`,
    });
  } catch (err) {
    console.error("Expense parse (Gemini call) failed:", err);
    throw new AppError("Could not parse expense from that text. Try rephrasing.", 422);
  }

  const parsed = parseExpenseResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Expense parse schema validation failed:", parsed.error.issues, "raw:", raw);
    throw new AppError("Could not parse expense from that text. Try rephrasing.", 422);
  }

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