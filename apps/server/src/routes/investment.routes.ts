import { Router } from "express";
import { createInvestment, listInvestments } from "../controllers/investment.controller";

const router: Router = Router();

router.post("/", createInvestment);
router.get("/", listInvestments);

export default router;