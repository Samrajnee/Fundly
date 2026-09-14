import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { hashPassword, comparePassword, generateToken } from "../services/auth.service";
import { createDefaultCategoriesForUser } from "../services/category.service";
import { AppError } from "../middlewares/errorHandler";
import { env } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    await createDefaultCategoriesForUser(user.id);

    const token = generateToken(user.id);
    res.cookie("fundly_token", token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user.id);
    res.cookie("fundly_token", token, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("fundly_token");
  res.json({ success: true, data: null });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}