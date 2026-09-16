import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { askFundly } from "../services/aiAssistant.service";
import { logAiUsage } from "../services/aiRateLimit.service";

const askSchema = z.object({
  question: z.string().min(3).max(500),
});

export async function askFundlyController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = askSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    let answer;

    try {
      answer = await askFundly(
        req.userId!,
        parsed.data.question
      );

      await logAiUsage(
        req.userId!,
        "ASSISTANT",
        true
      );
    } catch (err) {
      await logAiUsage(
        req.userId!,
        "ASSISTANT",
        false
      );

      throw err;
    }

    res.json({
      success: true,
      data: { answer },
    });
  } catch (err) {
    next(err);
  }
}