import { Router } from "express";
import { getAiUsage } from "../controllers/aiUsage.controller";

const router: Router = Router();

router.get("/", getAiUsage);

export default router;