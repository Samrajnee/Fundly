import { Router } from "express";
import { simulateSalaryIncrement } from "../controllers/salaryIncrement.controller";

const router: Router = Router();

router.post("/", simulateSalaryIncrement);

export default router;