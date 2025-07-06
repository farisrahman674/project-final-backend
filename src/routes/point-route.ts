import express from "express";
import { transferPoint } from "../controllers/point-controller";
import { authenticate } from "../middlewares/auth-middleware";
import { authorizeRole } from "../middlewares/role-middleware";

const router = express.Router();

router.post("/transfer", authenticate, authorizeRole("user"), transferPoint);

export default router;
