import { Router } from "express";
import { getMonthlyReview } from "../controllers/monthlyReview.controller";

const router: Router = Router();

router.get("/", getMonthlyReview);

export default router;