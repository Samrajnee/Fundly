import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { hashPassword, comparePassword } from "../services/auth.service";

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function updateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    if (parsed.data.email) {
      const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (existing && existing.id !== req.userId!) {
        throw new AppError("That email is already in use", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: parsed.data,
      select: { id: true, name: true, email: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const valid = await comparePassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: req.userId! },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}