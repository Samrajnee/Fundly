import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";



export async function getNetWorth(req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: req.userId! } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: req.userId! } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;

    const goals = await prisma.goal.findMany({ where: { userId: req.userId!, status: "ACTIVE" } });
    const otherSavings = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

    const debts = await prisma.debt.findMany({ where: { userId: req.userId! } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);

    const totalAssets = totalInvestments + emergencyFundAmount + otherSavings;
    const netWorth = totalAssets - totalDebt;

    const history = await prisma.netWorthSnapshot.findMany({
      where: { userId: req.userId! },
      orderBy: { snapshotDate: "asc" },
      take: 24,
    });

    res.json({
      success: true,
      data: {
        investments: Math.round(totalInvestments * 100) / 100,
        emergencyFund: Math.round(emergencyFundAmount * 100) / 100,
        otherSavings: Math.round(otherSavings * 100) / 100,
        totalAssets: Math.round(totalAssets * 100) / 100,
        totalDebt: Math.round(totalDebt * 100) / 100,
        netWorth: Math.round(netWorth * 100) / 100,
        history: history.map((h) => ({
          date: h.snapshotDate.toISOString().slice(0, 10),
          netWorth: Number(h.netWorth),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createNetWorthSnapshot(req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: req.userId! } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: req.userId! } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;

    const goals = await prisma.goal.findMany({ where: { userId: req.userId!, status: "ACTIVE" } });
    const otherSavings = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

    const debts = await prisma.debt.findMany({ where: { userId: req.userId! } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);

    const totalAssets = totalInvestments + emergencyFundAmount + otherSavings;
    const netWorth = totalAssets - totalDebt;

    const snapshot = await prisma.netWorthSnapshot.create({
      data: {
        userId: req.userId!,
        totalAssets,
        totalLiabilities: totalDebt,
        netWorth,
      },
    });

    res.status(201).json({ success: true, data: snapshot });
  } catch (err) {
    next(err);
  }
}