export interface SalaryPlannerInput {
  monthlySalary: number;
  livingSituation: "WITH_PARENTS" | "RENTING_ALONE" | "RENTING_SHARED" | "OWN_HOME";
  supportsFamily: boolean;
  fixedExpenses: number;
}

export interface SalaryBreakdown {
  necessitiesAmount: number;
  lifestyleAmount: number;
  savingsAmount: number;
  investmentsAmount: number;
  goalsAmount: number;
  bufferAmount: number;
}

export interface SalaryBreakdownWithReasoning extends SalaryBreakdown {
  reasoning: string;
  source: "AI" | "RULE_BASED";
}