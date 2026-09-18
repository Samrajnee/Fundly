import { Router } from "express";

import {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller";

const router: Router = Router();
router.post("/", createTransaction);
router.get("/", listTransactions);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;