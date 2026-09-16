import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { simulateWhatIf } from "../services/aiWhatIf.service";
import { logAiUsage } from "../services/aiRateLimit.service";

const whatIfSchema = z.object({
  question: z.string().min(3),
});

export async function runWhatIf(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = whatIfSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    let result;

    try {
      result = await simulateWhatIf(
        req.userId!,
        parsed.data.question
      );

      await logAiUsage(
        req.userId!,
        "WHAT_IF",
        true
      );
    } catch (err) {
      await logAiUsage(
        req.userId!,
        "WHAT_IF",
        false
      );

      throw err;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}