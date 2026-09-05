import { z } from "zod";

export const createTransactionSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  merchant: z.string().optional(),
  note: z.string().optional(),
  date: z.string().min(1), // ISO date string
});

export const listTransactionsQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().optional(),
  categoryId: z.string().optional(),
});