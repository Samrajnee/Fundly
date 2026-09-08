import { Router } from "express";
import { getLifestyleInflation } from "../controllers/lifestyleInflation.controller";

const router: Router = Router();

router.get("/", getLifestyleInflation);

export default router;