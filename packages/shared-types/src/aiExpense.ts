export interface ParseExpenseInput {
  text: string;
}

export interface ParsedExpenseDTO {
  amount: number;
  merchant: string | null;
  date: string; // ISO date
  suggestedCategoryName: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}