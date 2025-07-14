import { Router } from "express";
import { authenticate } from "../middlewares/auth-middleware";
import { authorizeRole } from "../middlewares/role-middleware";
import {
  createProduct,
  getAllProducts,
  softDeleteProduct,
  restoreProduct,
  updateProductImage,
  getProductById,
} from "../controllers/product-controller";
import { upload } from "../middlewares/upload-middleware";
import { validate } from "../middlewares/product-middleware";
import { createProductSchema } from "../validations/product-validation";
const router = Router();

// hanya admin yang bisa buat produk
router.post(
  "/add",
  authenticate,
  authorizeRole("admin"),
  upload.single("image"),
  validate(createProductSchema),
  createProduct
);

//update image
router.patch(
  "/:id/image",
  authenticate,
  authorizeRole("admin"),
  upload.single("image"),
  updateProductImage
);

// user & admin bisa lihat produk
router.get("/", getAllProducts);

// Detail Product
router.get("/:id", getProductById);

// PATCH /products/:id/delete → admin only
router.patch(
  "/:id/delete",
  authenticate,
  authorizeRole("admin"),
  softDeleteProduct
);

// PATCH /products/:id/restore → admin only
router.patch(
  "/:id/restore",
  authenticate,
  authorizeRole("admin"),
  restoreProduct
);

export default router;
