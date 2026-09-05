import { Router } from "express";
import { listCategories } from "../controllers/category.controller";

const router: Router = Router();

router.get("/", listCategories);

export default router;