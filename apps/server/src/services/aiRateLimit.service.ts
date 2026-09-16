import { prisma } from "@fundly/database";
import { env } from "../config/env";

export type AiFeatureKey =
  | "SALARY_ALLOCATION"
  | "EXPENSE_PARSE"
  | "ASSISTANT"
  | "MONTHLY_REVIEW"
  | "GOAL_PLANNER"
  | "WHAT_IF";

export interface RateLimitResult {
  allowed: boolean;
  reason?: "USER_DAILY_LIMIT" | "GLOBAL_MONTHLY_CAP";
  userCallsToday: number;
  userDailyLimit: number;
}

export async function checkAiRateLimit(userId: string): Promise<RateLimitResult> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [userCallsToday, globalCallsThisMonth] = await Promise.all([
    prisma.aiUsageLog.count({
      where: { userId, createdAt: { gte: startOfToday } },
    }),
    prisma.aiUsageLog.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
  ]);

  if (globalCallsThisMonth >= env.AI_MONTHLY_GLOBAL_CAP) {
    return {
      allowed: false,
      reason: "GLOBAL_MONTHLY_CAP",
      userCallsToday,
      userDailyLimit: env.AI_DAILY_LIMIT_PER_USER,
    };
  }

  if (userCallsToday >= env.AI_DAILY_LIMIT_PER_USER) {
    return {
      allowed: false,
      reason: "USER_DAILY_LIMIT",
      userCallsToday,
      userDailyLimit: env.AI_DAILY_LIMIT_PER_USER,
    };
  }

  return { allowed: true, userCallsToday, userDailyLimit: env.AI_DAILY_LIMIT_PER_USER };
}

export async function logAiUsage(userId: string, feature: AiFeatureKey, succeeded: boolean) {
  await prisma.aiUsageLog.create({
    data: { userId, feature, succeeded },
  });
}