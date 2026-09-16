import { Request, Response, NextFunction } from "express";
import { checkAiRateLimit } from "../services/aiRateLimit.service";
import { AppError } from "./errorHandler";

export async function aiRateLimit(req: Request, _res: Response, next: NextFunction) {
  try {
    const result = await checkAiRateLimit(req.userId!);

    if (!result.allowed) {
      if (result.reason === "GLOBAL_MONTHLY_CAP") {
        throw new AppError(
          "AI features are temporarily paused for this month. All other features work normally.",
          429
        );
      }
      throw new AppError(
        `You've used all ${result.userDailyLimit} AI requests for today. They reset tomorrow.`,
        429
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}