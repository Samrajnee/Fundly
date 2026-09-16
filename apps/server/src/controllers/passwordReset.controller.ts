import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";
import { createPasswordResetToken, resetPasswordWithToken } from "../services/passwordReset.service";
import { env } from "../config/env";

const requestSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });

export async function requestPasswordReset(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const rawToken = await createPasswordResetToken(parsed.data.email);

    if (rawToken) {
      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

      // TODO: replace with real email delivery — see note below.
      if (env.NODE_ENV === "development") {
        console.log(`\n[DEV] Password reset link for ${parsed.data.email}:\n${resetUrl}\n`);
      }
    }

    // Always the same response, whether or not the email exists.
    res.json({
      success: true,
      data: { message: "If an account exists for that email, a reset link has been sent." },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    await resetPasswordWithToken(parsed.data.token, parsed.data.newPassword);

    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}