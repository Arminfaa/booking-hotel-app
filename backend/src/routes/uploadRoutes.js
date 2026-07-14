import { Router } from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Any authenticated user can upload (profile avatars + host listing images)
router.post("/image", protect, upload.single("image"), uploadImage);

export default router;
