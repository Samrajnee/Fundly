import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { createDefaultCategoriesForUser } from "../services/category.service";

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    // Idempotent upsert - ensures any default category added since this
    // user registered (like Miscellaneous) actually shows up for them.
    await createDefaultCategoriesForUser(req.userId!);

    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
      orderBy: { type: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}