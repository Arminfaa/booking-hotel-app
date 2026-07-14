import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import {
  clearAuthCookies,
  hashToken,
  issueAuthCookies,
  readAccessToken,
  readRefreshToken,
  rotateRefreshToken,
} from "../utils/tokens.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const token = readAccessToken(req);
  if (!token) throw new ApiError(401, "Authentication required");

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  if (decoded.typ && decoded.typ !== "access") {
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readAccessToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.typ && decoded.typ !== "access") return next();
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // ignore
  }
  next();
});

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission for this action"));
    }
    next();
  };

export async function attachSession(res, user, req) {
  await issueAuthCookies(res, user, {
    userAgent: req.get("user-agent") || "",
    ip: req.ip,
  });
}

export async function refreshSession(req, res) {
  const refreshToken = readRefreshToken(req);
  if (!refreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (decoded.typ && decoded.typ !== "refresh") {
    throw new ApiError(401, "Invalid refresh token");
  }

  const stored = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token revoked or expired");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  await rotateRefreshToken(res, user, refreshToken, {
    userAgent: req.get("user-agent") || "",
    ip: req.ip,
  });

  return user;
}

export async function destroySession(req, res) {
  await clearAuthCookies(res, readRefreshToken(req));
}
