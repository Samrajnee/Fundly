export type RecurrenceFrequency = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface CreateRecurringExpenseInput {
  categoryId: string;
  label: string;
  amount: number;
  frequency: RecurrenceFrequency;
  dueDay?: number;
}

export interface RecurringExpenseDTO extends CreateRecurringExpenseInput {
  id: string;
  isActive: boolean;
}