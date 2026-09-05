export type CategoryType = "NECESSITY" | "LIFESTYLE" | "SAVINGS" | "INVESTMENT" | "GOAL";

export interface CreateTransactionInput {
  categoryId: string;
  amount: number;
  merchant?: string;
  note?: string;
  date: string; // ISO date
}

export interface TransactionDTO extends CreateTransactionInput {
  id: string;
  userId: string;
  source: "MANUAL" | "AI_PARSED" | "RECURRING";
  createdAt: string;
}