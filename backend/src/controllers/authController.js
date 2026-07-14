import { body } from "express-validator";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { attachSession, destroySession, refreshSession } from "../middleware/auth.js";

export const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["guest", "host"]),
];

export const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name,
    email,
    password,
    role: role === "host" ? "host" : "guest",
  });

  await attachSession(res, user, req);

  res.status(201).json({
    success: true,
    data: { user: user.toSafeJSON() },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  await attachSession(res, user, req);

  res.json({
    success: true,
    data: { user: user.toSafeJSON() },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const user = await refreshSession(req, res);
  res.json({
    success: true,
    data: { user: user.toSafeJSON() },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await destroySession(req, res);
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: { user: user.toSafeJSON() } });
});
