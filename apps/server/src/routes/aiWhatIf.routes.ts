import { Router } from "express";
import { runWhatIf } from "../controllers/aiWhatIf.controller";

const router: Router = Router();

router.post("/simulate", runWhatIf);

export default router;