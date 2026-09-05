import { Router } from "express";
import { createSalaryPlan, getActiveSalaryPlan } from "../controllers/salary.controller";

const router: Router = Router();

router.post("/", createSalaryPlan);
router.get("/active", getActiveSalaryPlan);

export default router;