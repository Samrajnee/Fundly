import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { parseExpenseText } from "../services/aiExpenseParser.service";
import { logAiUsage } from "../services/aiRateLimit.service";

const parseSchema = z.object({
  text: z.string().min(3),
});

export async function parseExpense(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = parseSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
      select: { name: true },
    });

    if (categories.length === 0) {
      throw new AppError(
        "No categories found for your account.",
        404
      );
    }

    let result;

    try {
      result = await parseExpenseText(
        parsed.data.text,
        categories.map((c) => c.name)
      );

      await logAiUsage(
        req.userId!,
        "EXPENSE_PARSE",
        true
      );
    } catch (err) {
      await logAiUsage(
        req.userId!,
        "EXPENSE_PARSE",
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
