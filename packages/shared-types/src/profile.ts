export type LivingSituation = "WITH_PARENTS" | "RENTING_ALONE" | "RENTING_SHARED" | "OWN_HOME";
export type IncomeType = "FIXED_SALARY" | "IRREGULAR" | "FREELANCE";

export interface UpdateProfileInput {
  livingSituation?: LivingSituation;
  incomeType?: IncomeType;
  supportsFamily?: boolean;
  isFirstSalary?: boolean;
}

export interface ProfileDTO {
  id: string;
  name: string;
  email: string;
  livingSituation: LivingSituation | null;
  incomeType: IncomeType;
  supportsFamily: boolean;
  isFirstSalary: boolean;
  hasCompletedOnboarding: boolean;
}