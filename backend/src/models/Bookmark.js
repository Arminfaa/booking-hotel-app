import mongoose from "mongoose";

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

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
