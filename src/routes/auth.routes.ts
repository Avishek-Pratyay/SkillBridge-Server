import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import verifyJWT from "../middlewares/verifyJWT";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;