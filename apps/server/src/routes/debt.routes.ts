import { Router } from "express";
import { createDebt, listDebts } from "../controllers/debt.controller";

const router: Router = Router();

router.post("/", createDebt);
router.get("/", listDebts);

export default router;