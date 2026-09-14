import { Router } from "express";
import { getAiMonthlyReview } from "../controllers/aiMonthlyReview.controller";

const router: Router = Router();

router.get("/", getAiMonthlyReview);

export default router;