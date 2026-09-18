import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { parseExpenseText } from "../services/aiExpenseParser.service";

const parseSchema = z.object({ text: z.string().min(3) });

export async function parseExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parseSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
      select: { id: true, name: true },
    });

    if (categories.length === 0) {
      throw new AppError("No categories found for your account.", 404);
    }

    const result = await parseExpenseText(parsed.data.text, categories.map((c) => c.name));

    let resolvedCategory = categories.find((c) => c.name === result.suggestedCategoryName);
    let usedFallbackCategory = false;

    if (!resolvedCategory || result.confidence === "LOW") {
      resolvedCategory = categories.find((c) => c.name === "Miscellaneous") ?? categories[0];
      usedFallbackCategory = true;
    }

    res.json({
      success: true,
      data: {
        amount: result.amount,
        merchant: result.merchant,
        date: result.date,
        resolvedCategoryId: resolvedCategory.id,
        resolvedCategoryName: resolvedCategory.name,
        confidence: result.confidence,
        usedFallbackCategory,
      },
    });
  } catch (err) {
    next(err);
  }
}