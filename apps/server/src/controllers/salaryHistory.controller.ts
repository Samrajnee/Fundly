import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

export async function getSalaryHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.salaryProfile.findMany({
      where: { userId: req.userId! },
      orderBy: { effectiveFrom: "asc" },
    });

    const history = plans.map((plan, idx) => {
      const previous = idx > 0 ? plans[idx - 1] : null;
      const salary = Number(plan.monthlySalary);

      let changeFromPrevious = null;
      if (previous) {
        const prevSalary = Number(previous.monthlySalary);
        const salaryDelta = Math.round((salary - prevSalary) * 100) / 100;
        const salaryDeltaPercent = prevSalary > 0 ? Math.round((salaryDelta / prevSalary) * 10000) / 100 : 0;
        changeFromPrevious = { salaryDelta, salaryDeltaPercent };
      }

      return {
        id: plan.id,
        monthlySalary: salary,
        livingSituation: plan.livingSituation,
        supportsFamily: plan.supportsFamily,
        necessitiesAmount: Number(plan.necessitiesAmount),
        lifestyleAmount: Number(plan.lifestyleAmount),
        savingsAmount: Number(plan.savingsAmount),
        investmentsAmount: Number(plan.investmentsAmount),
        goalsAmount: Number(plan.goalsAmount),
        bufferAmount: Number(plan.bufferAmount),
        isActive: plan.isActive,
        effectiveFrom: plan.effectiveFrom.toISOString(),
        changeFromPrevious,
      };
    });

    // Return most recent first for display.
    res.json({ success: true, data: history.reverse() });
  } catch (err) {
    next(err);
  }
}