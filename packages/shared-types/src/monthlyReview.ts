export interface CategoryComparison {
  label: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export interface MonthlyReviewDTO {
  month: number;
  year: number;
  comparisons: CategoryComparison[];
  totalPlanned: number;
  totalActual: number;
  savingsRateActual: number;
}