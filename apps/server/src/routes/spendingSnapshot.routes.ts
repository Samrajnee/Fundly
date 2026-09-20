import { Router } from "express";
import { createSpendingSnapshot, listSpendingSnapshots } from "../controllers/spendingSnapshot.controller";

const router: Router = Router();

router.post("/", createSpendingSnapshot);
router.get("/", listSpendingSnapshots);

export default router;