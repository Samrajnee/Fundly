import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";



export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
      orderBy: { type: "asc" },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}