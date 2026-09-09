import { Router } from "express";
import { getMilestones } from "../controllers/milestone.controller";

const router: Router = Router();

router.get("/", getMilestones);

export default router;