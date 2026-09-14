import { Router } from "express";
import { listEducationArticles, getEducationArticle } from "../controllers/education.controller";

const router: Router = Router();

router.get("/", listEducationArticles);
router.get("/:slug", getEducationArticle);

export default router;