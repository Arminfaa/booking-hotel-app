import { Router } from "express";
import {
  addBookmark,
  checkBookmark,
  listBookmarks,
  removeBookmark,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listBookmarks);
router.post("/", addBookmark);
router.get("/:hotelId/status", checkBookmark);
router.delete("/:hotelId", removeBookmark);

export default router;
