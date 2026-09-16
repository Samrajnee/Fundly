import { Router } from "express";
import { createInsurance, listInsurance, updateInsurance, deleteInsurance } from "../controllers/insurance.controller";

const router: Router = Router();

router.post("/", createInsurance);
router.get("/", listInsurance);
router.patch("/:id", updateInsurance);
router.delete("/:id", deleteInsurance);

export default router;