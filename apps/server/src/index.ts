import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { requireAuth } from "./middlewares/requireAuth";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import salaryRoutes from "./routes/salary.routes";
import transactionRoutes from "./routes/transaction.routes";
import categoryRoutes from "./routes/category.routes";
import budgetRoutes from "./routes/budget.routes";
import safeToSpendRoutes from "./routes/safeToSpend.routes";
import recurringRoutes from "./routes/recurring.routes";
import goalRoutes from "./routes/goal.routes";
import investmentRoutes from "./routes/investment.routes";
import debtRoutes from "./routes/debt.routes";
import insuranceRoutes from "./routes/insurance.routes";
import healthScoreRoutes from "./routes/healthScore.routes";
import emergencyFundRoutes from "./routes/emergencyFund.routes";
import salaryIncrementRoutes from "./routes/salaryIncrement.routes";
import lifestyleInflationRoutes from "./routes/lifestyleInflation.routes";
import monthlyPlanRoutes from "./routes/monthlyPlan.routes";
import monthlyReviewRoutes from "./routes/monthlyReview.routes";
import netWorthRoutes from "./routes/netWorth.routes";
import milestoneRoutes from "./routes/milestone.routes";
import spendingInsightsRoutes from "./routes/spendingInsights.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import profileRoutes from "./routes/profile.routes";
import educationRoutes from "./routes/education.routes";
import aiExpenseRoutes from "./routes/aiExpense.routes";
import aiAssistantRoutes from "./routes/aiAssistant.routes";
import aiMonthlyReviewRoutes from "./routes/aiMonthlyReview.routes";
import aiGoalPlannerRoutes from "./routes/aiGoalPlanner.routes";
import aiWhatIfRoutes from "./routes/aiWhatIf.routes";
import salaryHistoryRoutes from "./routes/salaryHistory.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Public routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Protected routes - every one of these now requires a valid session
app.use("/api/salary", requireAuth, salaryRoutes);
app.use("/api/transactions", requireAuth, transactionRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/budgets", requireAuth, budgetRoutes);
app.use("/api/safe-to-spend", requireAuth, safeToSpendRoutes);
app.use("/api/recurring", requireAuth, recurringRoutes);
app.use("/api/goals", requireAuth, goalRoutes);
app.use("/api/investments", requireAuth, investmentRoutes);
app.use("/api/debts", requireAuth, debtRoutes);
app.use("/api/insurance", requireAuth, insuranceRoutes);
app.use("/api/health-score", requireAuth, healthScoreRoutes);
app.use("/api/emergency-fund", requireAuth, emergencyFundRoutes);
app.use("/api/salary-increment", requireAuth, salaryIncrementRoutes);
app.use("/api/lifestyle-inflation", requireAuth, lifestyleInflationRoutes);
app.use("/api/monthly-plan", requireAuth, monthlyPlanRoutes);
app.use("/api/monthly-review", requireAuth, monthlyReviewRoutes);
app.use("/api/net-worth", requireAuth, netWorthRoutes);
app.use("/api/milestones", requireAuth, milestoneRoutes);
app.use("/api/spending-insights", requireAuth, spendingInsightsRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/profile", requireAuth, profileRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/ai/expense", requireAuth, aiExpenseRoutes);
app.use("/api/ai/assistant", requireAuth, aiAssistantRoutes);
app.use("/api/ai/monthly-review", requireAuth, aiMonthlyReviewRoutes);
app.use("/api/ai/goal-planner", requireAuth, aiGoalPlannerRoutes);
app.use("/api/ai/what-if", requireAuth, aiWhatIfRoutes);
app.use("/api/salary-history", requireAuth, salaryHistoryRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Fundly server running on port ${env.PORT}`);
});