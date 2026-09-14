import { Request, Response, NextFunction } from "express";
import { generateAiMonthlyReview } from "../services/aiMonthlyReview.service";

export async function getAiMonthlyReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await generateAiMonthlyReview(req.userId!);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}