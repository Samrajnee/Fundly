export interface SalaryPlannerInput {
  monthlySalary: number;
  livingSituation: "WITH_PARENTS" | "RENTING_ALONE" | "RENTING_SHARED" | "OWN_HOME";
  supportsFamily: boolean;
  fixedExpenses: number;
  existingSavingsGoalPercent?: number;
}

export interface SalaryBreakdown {
  necessitiesAmount: number;
  lifestyleAmount: number;
  savingsAmount: number;
  investmentsAmount: number;
  goalsAmount: number;
  bufferAmount: number;
}