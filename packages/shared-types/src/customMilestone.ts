export interface CreateCustomMilestoneInput {
  label: string;
}

export interface CustomMilestoneDTO {
  id: string;
  label: string;
  achieved: boolean;
  achievedAt: string | null;
  createdAt: string;
}