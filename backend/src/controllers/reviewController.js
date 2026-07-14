import { body } from "express-validator";
import { Review } from "../models/Review.js";
import { Hotel } from "../models/Hotel.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReviewValidators = [
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").trim().isLength({ min: 5, max: 1000 }),
];

async function refreshHotelRating(hotelId) {
  const stats = await Review.aggregate([
    { $match: { hotel: hotelId } },
    {
      $group: {
        _id: "$hotel",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    await Hotel.findByIdAndUpdate(hotelId, {
      ratingAverage: Math.round(stats[0].ratingAverage * 10) / 10,
      ratingCount: stats[0].ratingCount,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      ratingAverage: 0,
      ratingCount: 0,
    });
  }
}

export const listReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hotel: req.params.id })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { reviews } });
});

export const createReview = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const pastStay = await Booking.findOne({
    hotel: hotel._id,
    guest: req.user._id,
    status: { $in: ["confirmed", "completed"] },
    checkOut: { $lte: new Date() },
  });

  // Portfolio UX: allow reviews after a confirmed booking exists,
  // or from hosts/admins for demo seed data flexibility.
  const anyBooking = await Booking.findOne({
    hotel: hotel._id,
    guest: req.user._id,
    status: { $in: ["confirmed", "completed"] },
  });

  if (!pastStay && !anyBooking && req.user.role === "guest") {
    throw new ApiError(403, "Book this stay before leaving a review");
  }

  const existing = await Review.findOne({ hotel: hotel._id, user: req.user._id });
  if (existing) {
    throw new ApiError(409, "You already reviewed this hotel");
  }

  const review = await Review.create({
    hotel: hotel._id,
    user: req.user._id,
    booking: anyBooking?._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await refreshHotelRating(hotel._id);
  const populated = await review.populate("user", "name avatar");

  res.status(201).json({ success: true, data: { review: populated } });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to delete this review");
  }

  const hotelId = review.hotel;
  await review.deleteOne();
  await refreshHotelRating(hotelId);

  res.json({ success: true, message: "Review deleted" });
});
