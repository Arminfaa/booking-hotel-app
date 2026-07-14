import { Router } from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.post(
  "/image",
  protect,
  authorize("host", "admin"),
  upload.single("image"),
  uploadImage
);

export default router;
