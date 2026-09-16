export interface SalaryHistoryEntryDTO {
  id: string;
  monthlySalary: number;
  livingSituation: string;
  supportsFamily: boolean;
  necessitiesAmount: number;
  lifestyleAmount: number;
  savingsAmount: number;
  investmentsAmount: number;
  goalsAmount: number;
  bufferAmount: number;
  isActive: boolean;
  effectiveFrom: string;
  changeFromPrevious: {
    salaryDelta: number;
    salaryDeltaPercent: number;
  } | null;
}