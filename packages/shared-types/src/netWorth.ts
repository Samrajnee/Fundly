export interface NetWorthBreakdown {
  investments: number;
  emergencyFund: number;
  otherSavings: number;
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
}

export interface NetWorthHistoryPoint {
  date: string;
  netWorth: number;
}

export interface NetWorthDTO extends NetWorthBreakdown {
  history: NetWorthHistoryPoint[];
}