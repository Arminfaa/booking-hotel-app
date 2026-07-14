import { Router } from "express";
import {
  login,
  loginValidators,
  me,
  register,
  registerValidators,
  updateMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);
router.get("/me", protect, me);
router.patch("/me", protect, updateMe);

export default router;
