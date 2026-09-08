import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";
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

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/goals", goalRoutes); 
app.use("/api/investments", investmentRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/health-score", healthScoreRoutes);
app.use("/api/emergency-fund", emergencyFundRoutes);
app.use("/api/salary-increment", salaryIncrementRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Fundly server running on port ${env.PORT}`);
});