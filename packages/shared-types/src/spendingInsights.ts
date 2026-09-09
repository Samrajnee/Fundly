export interface CategorySpend {
  categoryName: string;
  amount: number;
  percentOfTotal: number;
}

export interface MonthlySpendChange {
  month: string;
  amount: number;
  changePercent: number | null;
}

export interface SpendingInsightsDTO {
  topCategories: CategorySpend[];
  monthlyTrend: MonthlySpendChange[];
  currentMonthSavingsRate: number;
  currentMonthTotalSpend: number;
}