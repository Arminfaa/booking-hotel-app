import { Router } from "express";
import {
  getConversation,
  listConversations,
  sendMessage,
  startConversation,
  startValidators,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/conversations", listConversations);
router.post("/conversations", startValidators, validate, startConversation);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id/messages", sendMessage);

export default router;
