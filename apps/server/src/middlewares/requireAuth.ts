import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import { AppError } from "./errorHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.fundly_token;
    if (!token) {
      throw new AppError("Not authenticated", 401);
    }
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError("Not authenticated", 401));
  }
}