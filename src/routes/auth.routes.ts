import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "Auth Route Working",
  });
});

export default router;