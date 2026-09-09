import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";

const router: Router = Router();

router.get("/", getDashboard);

export default router;