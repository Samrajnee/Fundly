import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { planGoalFromDescription } from "../services/aiGoalPlanner.service";
import { logAiUsage } from "../services/aiRateLimit.service";

const planSchema = z.object({
  description: z.string().min(3),
});

export async function proposeGoal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = planSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    let proposal;

    try {
      proposal = await planGoalFromDescription(
        req.userId!,
        parsed.data.description
      );

      await logAiUsage(
        req.userId!,
        "GOAL_PLANNER",
        true
      );
    } catch (err) {
      await logAiUsage(
        req.userId!,
        "GOAL_PLANNER",
        false
      );

      throw err;
    }

    res.json({
      success: true,
      data: proposal,
    });
  } catch (err) {
    next(err);
  }
}