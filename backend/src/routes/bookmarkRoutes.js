import { Router } from "express";
import {
  addBookmark,
  checkBookmark,
  createShareLink,
  getSharedWishlist,
  listBookmarks,
  removeBookmark,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/shared/:token", getSharedWishlist);

router.use(protect);

router.get("/", listBookmarks);
router.post("/", addBookmark);
router.post("/share", createShareLink);
router.get("/:hotelId/status", checkBookmark);
router.delete("/:hotelId", removeBookmark);

export default router;
