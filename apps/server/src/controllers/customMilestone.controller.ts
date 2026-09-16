import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";
import { z } from "zod";
import { AppError } from "../middlewares/errorHandler";

const createSchema = z.object({ label: z.string().min(1).max(200) });

export async function createCustomMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 422);
    }

    const milestone = await prisma.customMilestone.create({
      data: { userId: req.userId!, label: parsed.data.label },
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}

export async function listCustomMilestones(req: Request, res: Response, next: NextFunction) {
  try {
    const milestones = await prisma.customMilestone.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: milestones });
  } catch (err) {
    next(err);
  }
}

export async function toggleCustomMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await prisma.customMilestone.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!milestone) {
      throw new AppError("Milestone not found", 404);
    }

    const newAchieved = !milestone.achieved;

    const updated = await prisma.customMilestone.update({
      where: { id: req.params.id },
      data: {
        achieved: newAchieved,
        achievedAt: newAchieved ? new Date() : null,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await prisma.customMilestone.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!milestone) {
      throw new AppError("Milestone not found", 404);
    }
    await prisma.customMilestone.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}