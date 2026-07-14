import { Bookmark } from "../models/Bookmark.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: "hotel",
      populate: { path: "host", select: "name" },
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { bookmarks } });
});

export const addBookmark = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.body.hotelId || req.params.hotelId);
  if (!hotel || !hotel.isPublished) {
    throw new ApiError(404, "Hotel not found");
  }

  const bookmark = await Bookmark.findOneAndUpdate(
    { user: req.user._id, hotel: hotel._id },
    {
      user: req.user._id,
      hotel: hotel._id,
      note: req.body.note || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("hotel");

  res.status(201).json({ success: true, data: { bookmark } });
});

export const removeBookmark = asyncHandler(async (req, res) => {
  const hotelId = req.params.hotelId;
  const bookmark = await Bookmark.findOneAndDelete({
    user: req.user._id,
    hotel: hotelId,
  });

  if (!bookmark) {
    throw new ApiError(404, "Bookmark not found");
  }

  res.json({ success: true, message: "Bookmark removed" });
});

export const checkBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOne({
    user: req.user._id,
    hotel: req.params.hotelId,
  });
  res.json({ success: true, data: { bookmarked: Boolean(bookmark) } });
});
