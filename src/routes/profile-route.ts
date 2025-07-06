import express from "express";
import { upload } from "../middlewares/upload-middleware";
import { uploadProfileImage } from "../controllers/profile-controller";
import { authenticate } from "../middlewares/auth-middleware";
import { authorizeRole } from "../middlewares/role-middleware";

const router = express.Router();

router.patch(
  "/update",
  authenticate,
  authorizeRole("user", "admin"),
  upload.single("image"),
  uploadProfileImage
);

export default router;
