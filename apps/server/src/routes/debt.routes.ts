import { Router } from "express";
import { createDebt, listDebts, updateDebt, deleteDebt } from "../controllers/debt.controller";

const router: Router = Router();

router.post("/", createDebt);
router.get("/", listDebts);
router.patch("/:id", updateDebt);
router.delete("/:id", deleteDebt);

export default router;