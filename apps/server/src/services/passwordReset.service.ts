import crypto from "crypto";
import { prisma } from "@fundly/database";
import { hashPassword } from "./auth.service";
import { AppError } from "../middlewares/errorHandler";

const TOKEN_EXPIRY_MINUTES = 30;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately return null rather than throwing — the controller responds
  // identically whether or not the email exists, so this endpoint can't be
  // used to discover which emails have accounts.
  if (!user) return null;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any existing unused tokens for this user.
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  });

  return rawToken;
}

export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<void> {
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
    throw new AppError("This reset link is invalid or has expired. Request a new one.", 400);
  }

  const newHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);
}