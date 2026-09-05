import { Router } from "express";
import { getFinancialHealthScore } from "../controllers/healthScore.controller";

const router: Router = Router();

router.get("/", getFinancialHealthScore);

export default router;