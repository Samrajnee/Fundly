export interface AiGoalPlannerInput {
  description: string;
}

export interface AiGoalProposalDTO {
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date
  monthlyRequired: number;
  feasible: boolean;
  reasoning: string;
}