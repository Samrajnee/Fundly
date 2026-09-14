import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const updateProfileSchema = z.object({
  livingSituation: z.enum(["WITH_PARENTS", "RENTING_ALONE", "RENTING_SHARED", "OWN_HOME"]).optional(),
  incomeType: z.enum(["FIXED_SALARY", "IRREGULAR", "FREELANCE"]).optional(),
  supportsFamily: z.boolean().optional(),
  isFirstSalary: z.boolean().optional(),
});

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        livingSituation: user.livingSituation,
        incomeType: user.incomeType,
        supportsFamily: user.supportsFamily,
        isFirstSalary: user.isFirstSalary,
        hasCompletedOnboarding: user.livingSituation !== null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: parsed.data,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        livingSituation: user.livingSituation,
        incomeType: user.incomeType,
        supportsFamily: user.supportsFamily,
        isFirstSalary: user.isFirstSalary,
        hasCompletedOnboarding: user.livingSituation !== null,
      },
    });
  } catch (err) {
    next(err);
  }
}