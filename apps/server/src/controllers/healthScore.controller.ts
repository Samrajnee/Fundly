import { Request, Response, NextFunction } from "express";
import { calculateFinancialHealthScore } from "../services/healthScore.service";

export async function getFinancialHealthScore(_req: Request, res: Response, next: NextFunction) {
  try {
    const score = await calculateFinancialHealthScore();
    res.json({ success: true, data: score });
  } catch (err) {
    next(err);
  }
}