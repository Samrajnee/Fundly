import { Request, Response, NextFunction } from "express";
import { evaluateMilestones } from "../services/milestone.service";

export async function getMilestones(_req: Request, res: Response, next: NextFunction) {
  try {
    const milestones = await evaluateMilestones();
    res.json({ success: true, data: milestones });
  } catch (err) {
    next(err);
  }
}