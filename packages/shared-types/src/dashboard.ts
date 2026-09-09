import type { SalaryBreakdown } from "./salary";
import type { SafeToSpendDTO } from "./budget";
import type { FinancialHealthScoreDTO } from "./healthScore";
import type { GoalDTO } from "./goal";

export interface DashboardDTO {
  hasActiveSalaryPlan: boolean;
  monthlySalary: number | null;
  breakdown: SalaryBreakdown | null;
  safeToSpend: SafeToSpendDTO | null;
  healthScore: {
    totalScore: number;
    maxScore: number;
  } | null;
  netWorth: number;
  activeGoalsCount: number;
  goalsSummary: Pick<GoalDTO, "id" | "name" | "currentAmount" | "targetAmount">[];
  recentMilestonesCount: number;
  emergencyFundPercentComplete: number | null;
}