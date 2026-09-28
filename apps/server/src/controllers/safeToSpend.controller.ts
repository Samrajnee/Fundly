import { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorHandler";
import { computeSafeToSpend } from "../services/safeToSpend.service";

export async function getSafeToSpend(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await computeSafeToSpend(req.userId!);
    if (!data) {
      throw new AppError("No active salary plan found. Create one first.", 404);
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}