import { Router } from "express";
import { setBudget, listBudgetProgress } from "../controllers/budget.controller";

const router: Router = Router();

router.post("/", setBudget);
router.get("/", listBudgetProgress);

export default router;