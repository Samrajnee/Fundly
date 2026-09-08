export interface LifestyleInflationDTO {
  hasEnoughData: boolean;
  salaryGrowthPercent: number | null;
  lifestyleSpendGrowthPercent: number | null;
  verdict: string;
  monthlyLifestyleSpend: { month: string; amount: number }[];
}