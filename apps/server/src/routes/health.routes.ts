import { Router } from "express";

const router: Router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "fundly-server" });
});

export default router;