import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const ACCESS_COOKIE = "cove_access";
export const REFRESH_COOKIE = "cove_refresh";

function msFromExpiry(expiry) {
  if (typeof expiry === "number") return expiry * 1000;
  const match = String(expiry).match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[unit];
}

export function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, typ: "access" },
    env.jwtSecret,
    { expiresIn: env.accessExpiresIn }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id, typ: "refresh", jti: crypto.randomUUID() },
    env.jwtSecret,
    { expiresIn: env.refreshExpiresIn }
  );
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

export async function issueAuthCookies(res, user, meta = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + msFromExpiry(env.refreshExpiresIn)),
    userAgent: meta.userAgent || "",
    ip: meta.ip || "",
  });

  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(msFromExpiry(env.accessExpiresIn)));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(msFromExpiry(env.refreshExpiresIn)));

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(res, user, oldRefreshToken, meta = {}) {
  if (oldRefreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(oldRefreshToken), revokedAt: null },
      { revokedAt: new Date() }
    );
  }
  return issueAuthCookies(res, user, meta);
}

export async function clearAuthCookies(res, refreshToken) {
  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken), revokedAt: null },
      { revokedAt: new Date() }
    );
  }
  const clearOpts = {
    path: "/",
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
  };
  res.clearCookie(ACCESS_COOKIE, clearOpts);
  res.clearCookie(REFRESH_COOKIE, clearOpts);
}

export function readAccessToken(req) {
  if (req.cookies?.[ACCESS_COOKIE]) return req.cookies[ACCESS_COOKIE];
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function readRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || null;
}
