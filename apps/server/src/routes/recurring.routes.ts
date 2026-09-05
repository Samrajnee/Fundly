import { Router } from "express";
import {
  createRecurringExpense,
  listRecurringExpenses,
  deactivateRecurringExpense,
} from "../controllers/recurring.controller";

const router: Router = Router();

router.post("/", createRecurringExpense);
router.get("/", listRecurringExpenses);
router.delete("/:id", deactivateRecurringExpense);

export default router;