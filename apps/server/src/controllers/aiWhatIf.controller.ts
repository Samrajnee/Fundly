import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { simulateWhatIf } from "../services/aiWhatIf.service";

const whatIfSchema = z.object({ question: z.string().min(3) });

export async function runWhatIf(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = whatIfSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const result = await simulateWhatIf(req.userId!, parsed.data.question);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}