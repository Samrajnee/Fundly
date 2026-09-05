export type InvestmentType = "MUTUAL_FUND" | "FIXED_DEPOSIT" | "PPF" | "EPF" | "NPS" | "STOCKS" | "OTHER";

export interface CreateInvestmentInput {
  type: InvestmentType;
  name: string;
  investedAmount: number;
  currentValue: number;
  startDate: string;
  notes?: string;
}

export interface InvestmentDTO extends CreateInvestmentInput {
  id: string;
  gainLoss: number;
  gainLossPercent: number;
}