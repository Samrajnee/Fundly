export type MilestoneKey =
  | "SAVED_50K"
  | "SAVED_1L"
  | "INVESTED_1L"
  | "EMERGENCY_FUND_3_MONTHS"
  | "EMERGENCY_FUND_6_MONTHS"
  | "DEBT_FREE"
  | "FIRST_GOAL_COMPLETED"
  | "NET_WORTH_POSITIVE";

export interface MilestoneDTO {
  key: MilestoneKey;
  label: string;
  achieved: boolean;
  achievedAt: string | null;
}