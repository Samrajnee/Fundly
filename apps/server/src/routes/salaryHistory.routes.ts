import { Router } from "express";
import { getSalaryHistory } from "../controllers/salaryHistory.controller";

const router: Router = Router();

router.get("/", getSalaryHistory);

export default router;