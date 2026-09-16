import { Router } from "express";
import {
  createRecurringExpense,
  listRecurringExpenses,
  deactivateRecurringExpense,
  updateRecurringExpense,
  postDueNow,
} from "../controllers/recurring.controller";

const router: Router = Router();

router.post("/", createRecurringExpense);
router.get("/", listRecurringExpenses);
router.patch("/:id", updateRecurringExpense);
router.delete("/:id", deactivateRecurringExpense);
router.post("/post-due", postDueNow);

export default router;