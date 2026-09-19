import { callGeminiTool, SchemaType } from "./gemini.service";
import { z } from "zod";
import { deterministicParseExpense } from "./deterministicExpenseParser.service";

const parseExpenseResponseSchema = z.object({
  amount: z.number().positive(),
  merchant: z.string().nullable().optional(),
  date: z.string().min(1),
  suggestedCategoryName: z.string().min(1),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export async function parseExpenseText(text: string, categoryNames: string[]) {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const raw = await callGeminiTool({
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

    const parsed = parseExpenseResponseSchema.safeParse(raw);
    if (parsed.success) {
      const parsedDate = new Date(parsed.data.date);
      if (!Number.isNaN(parsedDate.getTime()) && categoryNames.includes(parsed.data.suggestedCategoryName)) {
        return {
          amount: parsed.data.amount,
          merchant: parsed.data.merchant ?? null,
          date: parsed.data.date,
          suggestedCategoryName: parsed.data.suggestedCategoryName,
          confidence: parsed.data.confidence,
        };
      }
    }
    console.error("Gemini expense parse returned unusable data, falling back to keyword parser. Raw:", raw);
  } catch (err) {
    console.error("Gemini expense parse failed, falling back to keyword parser:", err);
  }

  // Deterministic fallback - always succeeds as long as an amount is present in the text.
  return deterministicParseExpense(text, categoryNames);
}