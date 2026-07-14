import path from "path";
import fs from "fs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

if (!env.isProd && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (env.isProd) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage: env.isProd ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Image file is required");

  // Local: save to disk under /uploads
  if (!env.isProd) {
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      data: {
        url,
        absoluteUrl: `${req.protocol}://${req.get("host")}${url}`,
      },
    });
    return;
  }

  // Production: upload to Cloudinary
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new ApiError(500, "Cloudinary is not configured for production");
  }

  const folder =
    typeof req.body?.folder === "string" && req.body.folder.trim()
      ? req.body.folder.trim()
      : "cove";

  const result = await uploadToCloudinary(req.file.buffer, folder);

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});
