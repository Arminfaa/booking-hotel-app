import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const iconsDir = path.join(publicDir, "icons");
const logoPath = path.join(publicDir, "images/cove-logo.webp");
const background = "#070e14";

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

await mkdir(iconsDir, { recursive: true });

for (const { name, size } of sizes) {
  const logoSize = Math.round(size * 0.72);
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const icon = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();

  await writeFile(path.join(iconsDir, name), icon);
  console.log(`Wrote icons/${name}`);
}
