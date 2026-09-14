import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { AppError } from "../middlewares/errorHandler";

export async function listEducationArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;

    const articles = await prisma.educationArticle.findMany({
      where: category ? { category: category as any } : undefined,
      select: { slug: true, title: true, category: true, summary: true, readMinutes: true },
      orderBy: { category: "asc" },
    });

    res.json({ success: true, data: articles });
  } catch (err) {
    next(err);
  }
}

export async function getEducationArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await prisma.educationArticle.findUnique({
      where: { slug: req.params.slug },
    });

    if (!article) {
      throw new AppError("Article not found", 404);
    }

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}