import { Router } from "express";
import { askFundlyController } from "../controllers/aiAssistant.controller";

const router: Router = Router();

router.post("/ask", askFundlyController);

export default router;