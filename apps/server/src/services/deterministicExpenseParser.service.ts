import { AppError } from "../middlewares/errorHandler";

interface DeterministicCategory {
  name: string;
  keywords: string[];
}

// Keyword groups mapped to the default category names. If a category name
// isn't present in the user's actual categories, that group is simply skipped.
const CATEGORY_KEYWORDS: DeterministicCategory[] = [
  { name: "Rent", keywords: ["rent"] },
  { name: "Groceries", keywords: ["grocery", "groceries", "vegetable", "milk", "supermarket"] },
  { name: "Utilities", keywords: ["electricity", "water bill", "utility", "utilities", "gas bill", "wifi", "internet bill"] },
  { name: "Transport", keywords: ["taxi", "cab", "fare", "uber", "ola", "bus", "train", "metro", "petrol", "fuel", "auto"] },
  { name: "Dining Out", keywords: ["dinner", "lunch", "breakfast", "restaurant", "cafe", "coffee", "dining", "food", "snack", "snacks"] },
  { name: "Entertainment", keywords: ["movie", "cinema", "game", "concert", "entertainment", "party"] },
  { name: "Shopping", keywords: ["shopping", "cloth", "clothes", "shirt", "shoes", "eyeglasses", "glasses", "bag", "gift", "stationery", "electronics"] },
  { name: "Subscriptions", keywords: ["netflix", "spotify", "subscription", "prime", "hotstar"] },
  { name: "General Savings", keywords: ["saving", "savings", "save"] },
  { name: "SIP / Mutual Funds", keywords: ["sip", "mutual fund", "invest", "investment"] },
];

function extractAmount(text: string): number | null {
  // Matches the first number in the text, with or without decimals,
  // regardless of currency symbols or words around it.
  const match = text.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  const cleaned = match[1].replace(",", "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function extractDate(text: string): string {
  const today = new Date();
  const lower = text.toLowerCase();

  if (lower.includes("yesterday")) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  }

  return today.toISOString().slice(0, 10);
}

function extractMerchant(text: string): string | null {
  // Looks for "at <word(s)>" or "on <word(s)>" as a light heuristic for a
  // merchant/place name. Returns null when nothing reasonable is found.
  const match = text.match(/\b(?:at|from)\s+([A-Za-z][A-Za-z\s]{1,30})/i);
  return match ? match[1].trim() : null;
}

export function deterministicParseExpense(
  text: string,
  categoryNames: string[]
): { amount: number; merchant: string | null; date: string; suggestedCategoryName: string; confidence: "MEDIUM" | "LOW" } {
  const amount = extractAmount(text);
  if (amount === null) {
    throw new AppError("Couldn't find an amount in that text. Try including a number, like 'spent 200 on lunch'.", 422);
  }

  const lower = text.toLowerCase();
  const availableNames = new Set(categoryNames);

  for (const group of CATEGORY_KEYWORDS) {
    if (!availableNames.has(group.name)) continue;
    if (group.keywords.some((kw) => lower.includes(kw))) {
      return {
        amount,
        merchant: extractMerchant(text),
        date: extractDate(text),
        suggestedCategoryName: group.name,
        confidence: "MEDIUM",
      };
    }
  }

  const fallbackCategory = categoryNames.includes("Miscellaneous") ? "Miscellaneous" : categoryNames[0];

  return {
    amount,
    merchant: extractMerchant(text),
    date: extractDate(text),
    suggestedCategoryName: fallbackCategory,
    confidence: "LOW",
  };
}