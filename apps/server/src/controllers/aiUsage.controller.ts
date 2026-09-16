import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { env } from "../config/env";

export async function getAiUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [userToday, userMonth, globalMonth, byFeature] = await Promise.all([
      prisma.aiUsageLog.count({ where: { userId: req.userId!, createdAt: { gte: startOfToday } } }),
      prisma.aiUsageLog.count({ where: { userId: req.userId!, createdAt: { gte: startOfMonth } } }),
      prisma.aiUsageLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.aiUsageLog.groupBy({
        by: ["feature"],
        where: { userId: req.userId!, createdAt: { gte: startOfMonth } },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        userCallsToday: userToday,
        userDailyLimit: env.AI_DAILY_LIMIT_PER_USER,
        userCallsThisMonth: userMonth,
        globalCallsThisMonth: globalMonth,
        globalMonthlyCap: env.AI_MONTHLY_GLOBAL_CAP,
        byFeature: byFeature.map((f) => ({ feature: f.feature, count: f._count })),
      },
    });
  } catch (err) {
    next(err);
  }
}