import type { SalaryBreakdown } from "./salary";

export interface WhatIfInput {
  question: string;
}

export interface WhatIfResultDTO {
  interpretation: string;
  current: SalaryBreakdown;
  projected: SalaryBreakdown;
  explanation: string;
}