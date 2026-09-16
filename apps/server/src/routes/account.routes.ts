import { Router } from "express";
import { updateAccount, changePassword } from "../controllers/account.controller";

const router: Router = Router();

router.patch("/", updateAccount);
router.post("/change-password", changePassword);

export default router;