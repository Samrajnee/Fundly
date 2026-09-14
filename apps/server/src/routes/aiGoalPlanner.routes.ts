import { Router } from "express";
import { proposeGoal } from "../controllers/aiGoalPlanner.controller";

const router: Router = Router();

router.post("/propose", proposeGoal);

export default router;