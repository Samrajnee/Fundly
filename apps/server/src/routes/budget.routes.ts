import { Router } from "express";
import { setBudget, listBudgetProgress, deleteBudget } from "../controllers/budget.controller";

const router: Router = Router();

router.post("/", setBudget);
router.get("/", listBudgetProgress);
router.delete("/:id", deleteBudget);

export default router;