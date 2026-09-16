import { Router } from "express";
import {
  createCustomMilestone,
  listCustomMilestones,
  toggleCustomMilestone,
  deleteCustomMilestone,
} from "../controllers/customMilestone.controller";

const router: Router = Router();

router.post("/", createCustomMilestone);
router.get("/", listCustomMilestones);
router.patch("/:id/toggle", toggleCustomMilestone);
router.delete("/:id", deleteCustomMilestone);

export default router;