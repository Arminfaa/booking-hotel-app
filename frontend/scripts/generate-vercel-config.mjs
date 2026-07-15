#!/usr/bin/env node
/**
 * Writes vercel.json with API/upload proxies so auth cookies stay first-party
 * on the Vercel domain (fixes Safari / cross-origin cookie blocking).
 *
 * Vercel env: BACKEND_ORIGIN=https://cove-booking.onrender.com
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const backend =
  process.env.BACKEND_ORIGIN?.replace(/\/$/, "") ||
  "https://cove-booking.onrender.com";

const config = {
  rewrites: [
    {
      source: "/api/:path*",
      destination: `${backend}/api/:path*`,
    },
    {
      source: "/uploads/:path*",
      destination: `${backend}/uploads/:path*`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};

writeFileSync(
  path.join(root, "vercel.json"),
  `${JSON.stringify(config, null, 2)}\n`
);

console.log(`vercel.json generated (BACKEND_ORIGIN=${backend})`);
