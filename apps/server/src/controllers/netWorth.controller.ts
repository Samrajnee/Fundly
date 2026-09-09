import { Request, Response, NextFunction } from "express";
import { prisma } from "@fundly/database";

const TEMP_USER_ID = "temp-user-id";

export async function getNetWorth(_req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: TEMP_USER_ID } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: TEMP_USER_ID } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;

    const goals = await prisma.goal.findMany({ where: { userId: TEMP_USER_ID, status: "ACTIVE" } });
    const otherSavings = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

    const debts = await prisma.debt.findMany({ where: { userId: TEMP_USER_ID } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);

    const totalAssets = totalInvestments + emergencyFundAmount + otherSavings;
    const netWorth = totalAssets - totalDebt;

    const history = await prisma.netWorthSnapshot.findMany({
      where: { userId: TEMP_USER_ID },
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

export async function createNetWorthSnapshot(_req: Request, res: Response, next: NextFunction) {
  try {
    const investments = await prisma.investment.findMany({ where: { userId: TEMP_USER_ID } });
    const totalInvestments = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);

    const emergencyFund = await prisma.emergencyFund.findUnique({ where: { userId: TEMP_USER_ID } });
    const emergencyFundAmount = emergencyFund ? Number(emergencyFund.currentAmount) : 0;

    const goals = await prisma.goal.findMany({ where: { userId: TEMP_USER_ID, status: "ACTIVE" } });
    const otherSavings = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);

    const debts = await prisma.debt.findMany({ where: { userId: TEMP_USER_ID } });
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.outstandingAmount), 0);

    const totalAssets = totalInvestments + emergencyFundAmount + otherSavings;
    const netWorth = totalAssets - totalDebt;

    const snapshot = await prisma.netWorthSnapshot.create({
      data: {
        userId: TEMP_USER_ID,
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