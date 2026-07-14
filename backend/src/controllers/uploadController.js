import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Image file is required");
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    data: {
      url,
      absoluteUrl: `${req.protocol}://${req.get("host")}${url}`,
    },
  });
});
