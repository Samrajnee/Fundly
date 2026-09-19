export interface CategorySpend {
  categoryName: string;
  amount: number;
  percentOfTotal: number;
}

export interface MonthlyTrendPoint {
  month: string;
  [categoryName: string]: string | number;
}

export interface SpendingInsightsDTO {
  topCategories: CategorySpend[];
  monthlyTrend: MonthlyTrendPoint[];
  trendCategories: string[];
  currentMonthSavingsRate: number;
  currentMonthTotalSpend: number;
}