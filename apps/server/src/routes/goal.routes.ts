import { Router } from "express";
import { createGoal, listGoals, contributeToGoal } from "../controllers/goal.controller";

const router: Router = Router();

router.post("/", createGoal);
router.get("/", listGoals);
router.post("/:id/contribute", contributeToGoal);

export default router;