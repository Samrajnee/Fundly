import { Router } from "express";
import { createTransaction, listTransactions, deleteTransaction } from "../controllers/transaction.controller";

const router: Router = Router();

router.post("/", createTransaction);
router.get("/", listTransactions);
router.delete("/:id", deleteTransaction);

export default router;