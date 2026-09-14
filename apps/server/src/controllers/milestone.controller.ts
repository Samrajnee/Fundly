import { Request, Response, NextFunction } from "express";
import { evaluateMilestones } from "../services/milestone.service";

export async function getMilestones(req: Request, res: Response, next: NextFunction) {
  try {
    const milestones = await evaluateMilestones(req.userId!);
    res.json({ success: true, data: milestones });
  } catch (err) {
    next(err);
  }
}