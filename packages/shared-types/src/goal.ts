export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  targetDate: string; // ISO date
}

export interface GoalDTO extends CreateGoalInput {
  id: string;
  currentAmount: number;
  monthlyRequired: number;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
}