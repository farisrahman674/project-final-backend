// routes/cartRoute.ts
import express from "express";
import {
  getMyCart,
  addToCart,
  updateCartQuantity,
  softDeleteCart,
  clearMyCart,
} from "../controllers/cart-controller";
import { authenticate } from "../middlewares/auth-middleware";

const router = express.Router();

router.post("/", authenticate, addToCart);
router.get("/mycart", authenticate, getMyCart);
router.patch("/update/:id", authenticate, updateCartQuantity);
router.delete("/softdelete/:id", authenticate, softDeleteCart);
router.delete("/clearall", authenticate, clearMyCart);
export default router;
