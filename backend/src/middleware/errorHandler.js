import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFound(_req, _res, next) {
  next(new ApiError(404, "Route not found"));
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (env.nodeEnv !== "production" && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.nodeEnv !== "production" && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
}
