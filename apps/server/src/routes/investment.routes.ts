import { Router } from "express";
import { createInvestment, listInvestments, updateInvestment, deleteInvestment } from "../controllers/investment.controller";

const router: Router = Router();

router.post("/", createInvestment);
router.get("/", listInvestments);
router.patch("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

export default router;