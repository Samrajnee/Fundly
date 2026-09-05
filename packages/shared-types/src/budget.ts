export interface SetBudgetInput {
  categoryId: string;
  monthlyLimit: number;
}

export interface BudgetProgressDTO {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface SafeToSpendDTO {
  dailySafeAmount: number;
  weeklySafeAmount: number;
  lifestyleBudgetRemaining: number;
  daysLeftInMonth: number;
}