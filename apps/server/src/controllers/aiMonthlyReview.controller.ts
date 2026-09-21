import { Request, Response, NextFunction } from "express";
import { generateAiMonthlyReview } from "../services/aiMonthlyReview.service";
import { logAiUsage } from "../services/aiRateLimit.service";

export async function getAiMonthlyReview(req: Request, res: Response, next: NextFunction) {
  try {
    const forceRefresh = req.query.refresh === "true";
    const review = await generateAiMonthlyReview(req.userId!, forceRefresh);
    if (forceRefresh) {
      await logAiUsage(req.userId!, "MONTHLY_REVIEW", review.source === "AI");
    }
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}