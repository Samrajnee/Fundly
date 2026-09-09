import { Router } from "express";
import { getNetWorth, createNetWorthSnapshot } from "../controllers/netWorth.controller";

const router: Router = Router();

router.get("/", getNetWorth);
router.post("/snapshot", createNetWorthSnapshot);

export default router;