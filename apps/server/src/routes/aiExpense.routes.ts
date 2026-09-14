import { Router } from "express";
import { parseExpense } from "../controllers/aiExpense.controller";

const router: Router = Router();

router.post("/parse", parseExpense);

export default router;