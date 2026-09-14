import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";



const createInvestmentSchema = z.object({
  type: z.enum(["MUTUAL_FUND", "FIXED_DEPOSIT", "PPF", "EPF", "NPS", "STOCKS", "OTHER"]),
  name: z.string().min(1),
  investedAmount: z.number().positive(),
  currentValue: z.number().nonnegative(),
  startDate: z.string().min(1),
  notes: z.string().optional(),
});

export async function createInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createInvestmentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const investment = await prisma.investment.create({
      data: {
        userId: req.userId!,
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
      },
    });

    res.status(201).json({ success: true, data: investment });
  } catch (err) {
    next(err);
  }
}

export async function listInvestments(req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await prisma.investment.findMany({
      where: { userId: req.userId! },
      orderBy: { startDate: "desc" },
    });

    const withGains = investments.map((inv) => {
      const invested = Number(inv.investedAmount);
      const current = Number(inv.currentValue);
      const gainLoss = Math.round((current - invested) * 100) / 100;
      const gainLossPercent = invested > 0 ? Math.round((gainLoss / invested) * 10000) / 100 : 0;
      return { ...inv, gainLoss, gainLossPercent };
    });

    res.json({ success: true, data: withGains });
  } catch (err) {
    next(err);
  }
}