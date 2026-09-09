import { Router } from "express";
import { getSpendingInsights } from "../controllers/spendingInsights.controller";

const router: Router = Router();

router.get("/", getSpendingInsights);

export default router;