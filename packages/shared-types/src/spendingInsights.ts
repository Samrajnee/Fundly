export interface CategorySpend {
  categoryName: string;
  amount: number;
  percentOfTotal: number;
}

export interface DailyTopCategoryEntry {
  date: string;
  categoryName: string;
  amount: number;
}

export interface SpendingInsightsDTO {
  topCategories: CategorySpend[];
  todayCategories: CategorySpend[];
  dailyTopCategories: DailyTopCategoryEntry[];
  currentMonthSavingsRate: number;
  currentMonthTotalSpend: number;
  todayTotalSpend: number;
  month: number;
  year: number;
}

export interface SpendingSnapshotDTO {
  id: string;
  month: number;
  year: number;
  totalSpend: number;
  savingsRate: number;
  categoryBreakdown: CategorySpend[];
  createdAt: string;
}