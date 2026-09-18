export interface ParseExpenseInput {
  text: string;
}

export interface ParsedExpenseDTO {
  amount: number;
  merchant: string | null;
  date: string;
  resolvedCategoryId: string;
  resolvedCategoryName: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  usedFallbackCategory: boolean;
}