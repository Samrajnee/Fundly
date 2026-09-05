export type InsuranceType = "HEALTH" | "LIFE" | "VEHICLE" | "HOME" | "OTHER";
export type PremiumFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";

export interface CreateInsuranceInput {
  type: InsuranceType;
  provider: string;
  coverageAmount: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  expiryDate: string;
  notes?: string;
}

export interface InsuranceDTO extends CreateInsuranceInput {
  id: string;
  isExpiringSoon: boolean;
}