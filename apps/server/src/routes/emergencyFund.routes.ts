import { Router } from "express";
import { getEmergencyFund, updateEmergencyFund } from "../controllers/emergencyFund.controller";

const router: Router = Router();

router.get("/", getEmergencyFund);
router.patch("/", updateEmergencyFund);

export default router;