export type DebtType = "CREDIT_CARD" | "PERSONAL_LOAN" | "HOME_LOAN" | "VEHICLE_LOAN" | "EDUCATION_LOAN" | "OTHER";

export interface CreateDebtInput {
  type: DebtType;
  lender: string;
  principalAmount: number;
  outstandingAmount: number;
  interestRate: number;
  emiAmount: number;
  tenureMonths: number;
  startDate: string;
}

export interface DebtDTO extends CreateDebtInput {
  id: string;
  percentPaidOff: number;
}