import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

const createDebtSchema = z.object({
  type: z.enum(["CREDIT_CARD", "PERSONAL_LOAN", "HOME_LOAN", "VEHICLE_LOAN", "EDUCATION_LOAN", "OTHER"]),
  lender: z.string().min(1),
  principalAmount: z.number().positive(),
  outstandingAmount: z.number().nonnegative(),
  interestRate: z.number().nonnegative(),
  emiAmount: z.number().positive(),
  tenureMonths: z.number().positive(),
  startDate: z.string().min(1),
});

export async function createDebt(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createDebtSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const debt = await prisma.debt.create({
      data: {
        userId: TEMP_USER_ID,
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
      },
    });

    res.status(201).json({ success: true, data: debt });
  } catch (err) {
    next(err);
  }
}

export async function listDebts(_req: Request, res: Response, next: NextFunction) {
  try {
    const debts = await prisma.debt.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { startDate: "desc" },
    });

    const withProgress = debts.map((d) => {
      const principal = Number(d.principalAmount);
      const outstanding = Number(d.outstandingAmount);
      const percentPaidOff =
        principal > 0 ? Math.round(((principal - outstanding) / principal) * 10000) / 100 : 0;
      return { ...d, percentPaidOff };
    });

    res.json({ success: true, data: withProgress });
  } catch (err) {
    next(err);
  }
}