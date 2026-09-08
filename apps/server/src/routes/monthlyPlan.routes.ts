import { Router } from "express";
import { getOrCreateMonthlyPlan, listMonthlyPlans } from "../controllers/monthlyPlan.controller";

const router: Router = Router();

router.get("/current", getOrCreateMonthlyPlan);
router.get("/", listMonthlyPlans);

export default router;