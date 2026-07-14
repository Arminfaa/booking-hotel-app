import mongoose from "mongoose";
import crypto from "crypto";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    note: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, hotel: 1 }, { unique: true });

const wishlistShareSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(16).toString("hex"),
    },
  },
  { timestamps: true }
);

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export const WishlistShare = mongoose.model("WishlistShare", wishlistShareSchema);
