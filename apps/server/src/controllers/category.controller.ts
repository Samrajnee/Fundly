import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

const TEMP_USER_ID = "temp-user-id";

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: TEMP_USER_ID },
      orderBy: { type: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}