import { Router } from "express";
import {
  getMe,
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} from "../controllers/auth-controller";
import { authenticate } from "../middlewares/auth-middleware";

const router = Router();

router.get("/me", authenticate, getMe);
router.post("/register", registerUser);
router.get("/check", checkAuth);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
