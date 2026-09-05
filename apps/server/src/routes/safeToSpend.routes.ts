import { Router } from "express";
import { getSafeToSpend } from "../controllers/safeToSpend.controller";

const router: Router = Router();

router.get("/", getSafeToSpend);

export default router;