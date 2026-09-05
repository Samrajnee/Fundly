import { Router } from "express";
import { createInsurance, listInsurance } from "../controllers/insurance.controller";

const router: Router = Router();

router.post("/", createInsurance);
router.get("/", listInsurance);

export default router;