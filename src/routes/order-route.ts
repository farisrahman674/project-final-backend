import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
} from "../controllers/order-controller";
import { authenticate } from "../middlewares/auth-middleware";
import { authorizeRole } from "../middlewares/role-middleware";

const router = Router();

router.post("/", authenticate, authorizeRole("user"), createOrder);
router.get("/me", authenticate, authorizeRole("user"), getMyOrders);
router.get("/allordered", authenticate, authorizeRole("admin"), getAllOrders);
router.patch("/:id/cancel", authenticate, authorizeRole("user"), cancelOrder);

export default router;
