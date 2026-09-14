import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { askFundly } from "../services/aiAssistant.service";

const askSchema = z.object({ question: z.string().min(3).max(500) });

export async function askFundlyController(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = askSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const answer = await askFundly(req.userId!, parsed.data.question);
    res.json({ success: true, data: { answer } });
  } catch (err) {
    next(err);
  }
}