import { z } from "zod";

export const salaryPlannerInputSchema = z.object({
  monthlySalary: z.number().positive(),
  livingSituation: z.enum(["WITH_PARENTS", "RENTING_ALONE", "RENTING_SHARED", "OWN_HOME"]),
  supportsFamily: z.boolean(),
  fixedExpenses: z.number().nonnegative(),
  existingSavingsGoalPercent: z.number().min(0).max(1).optional(),
});