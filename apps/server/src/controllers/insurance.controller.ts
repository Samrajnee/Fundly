import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const TEMP_USER_ID = "temp-user-id";

const createInsuranceSchema = z.object({
  type: z.enum(["HEALTH", "LIFE", "VEHICLE", "HOME", "OTHER"]),
  provider: z.string().min(1),
  coverageAmount: z.number().positive(),
  premiumAmount: z.number().positive(),
  premiumFrequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  expiryDate: z.string().min(1),
  notes: z.string().optional(),
});

export async function createInsurance(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createInsuranceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const policy = await prisma.insurancePolicy.create({
      data: {
        userId: TEMP_USER_ID,
        ...parsed.data,
        expiryDate: new Date(parsed.data.expiryDate),
      },
    });

    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
}

export async function listInsurance(_req: Request, res: Response, next: NextFunction) {
  try {
    const policies = await prisma.insurancePolicy.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { expiryDate: "asc" },
    });

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const withExpiry = policies.map((p) => ({
      ...p,
      isExpiringSoon: p.expiryDate <= ninetyDaysFromNow,
    }));

    res.json({ success: true, data: withExpiry });
  } catch (err) {
    next(err);
  }
}