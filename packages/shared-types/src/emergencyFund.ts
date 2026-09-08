export interface UpdateEmergencyFundInput {
  targetMonths?: number;
  contributionAmount?: number;
}

export interface EmergencyFundDTO {
  targetMonths: number;
  currentAmount: number;
  targetAmount: number;
  percentComplete: number;
  monthsCovered: number;
}