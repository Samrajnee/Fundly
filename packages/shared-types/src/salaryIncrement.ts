import type { SalaryBreakdown } from "./salary";

export interface SalaryIncrementInput {
  newMonthlySalary: number;
}

export interface SalaryIncrementComparisonDTO {
  current: SalaryBreakdown;
  projected: SalaryBreakdown;
  currentSalary: number;
  projectedSalary: number;
  increaseAmount: number;
  increasePercent: number;
}