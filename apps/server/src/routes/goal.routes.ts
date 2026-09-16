import { Router } from "express";
import { createGoal, listGoals, contributeToGoal, updateGoal, deleteGoal } from "../controllers/goal.controller";

const router: Router = Router();

router.post("/", createGoal);
router.get("/", listGoals);
router.post("/:id/contribute", contributeToGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;