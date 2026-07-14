import crypto from "crypto";
import { body } from "express-validator";
import { Booking } from "../models/Booking.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  calcPricing,
  hasBookingOverlap,
  nightsBetween,
  refundForCancel,
} from "../utils/booking.js";
import { sendBookingConfirmation } from "../services/email.js";

export const createBookingValidators = [
  body("hotelId").isMongoId(),
  body("checkIn").isISO8601(),
  body("checkOut").isISO8601(),
  body("guests.adults").isInt({ min: 1 }),
  body("guests.children").optional().isInt({ min: 0 }),
  body("specialRequests").optional().isString().isLength({ max: 500 }),
];

export const createBooking = asyncHandler(async (req, res) => {
  const { hotelId, checkIn, checkOut, guests, specialRequests } = req.body;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel || !hotel.isPublished) {
    throw new ApiError(404, "Hotel not found");
  }

  const totalGuests = Number(guests.adults) + Number(guests.children || 0);
  if (totalGuests > hotel.maxGuests) {
    throw new ApiError(400, `This stay allows up to ${hotel.maxGuests} guests`);
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    throw new ApiError(400, "Check-out must be after check-in");
  }

  if (new Date(checkIn) < startOfToday()) {
    throw new ApiError(400, "Check-in cannot be in the past");
  }

  const overlap = await hasBookingOverlap(hotel._id, checkIn, checkOut);
  if (overlap) {
    throw new ApiError(409, "These dates are not available");
  }

  const pricing = calcPricing({
    pricePerNight: hotel.pricePerNight,
    cleaningFee: hotel.cleaningFee,
    nights,
  });

  const booking = await Booking.create({
    hotel: hotel._id,
    guest: req.user._id,
    checkIn,
    checkOut,
    guests: {
      adults: guests.adults,
      children: guests.children || 0,
    },
    nights,
    pricePerNight: hotel.pricePerNight,
    cleaningFee: pricing.cleaningFee,
    serviceFee: pricing.serviceFee,
    tax: pricing.tax,
    totalPrice: pricing.totalPrice,
    cancellationPolicy: hotel.cancellationPolicy || "moderate",
    specialRequests: specialRequests || "",
    status: "pending",
    paymentStatus: "unpaid",
  });

  const populated = await booking.populate([
    {
      path: "hotel",
      select: "title city country images pricePerNight cancellationPolicy",
    },
    { path: "guest", select: "name email" },
  ]);

  res.status(201).json({ success: true, data: { booking: populated } });
});

export const payBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("hotel").populate("guest");
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.guest._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed to pay for this booking");
  }

  if (booking.paymentStatus === "paid") {
    throw new ApiError(400, "Booking is already paid");
  }

  if (booking.status === "cancelled") {
    throw new ApiError(400, "Cancelled bookings cannot be paid");
  }

  const cardNumber = String(req.body.cardNumber || "").replace(/\s+/g, "");
  if (cardNumber.length < 12) {
    throw new ApiError(400, "Enter a mock card number (12+ digits)");
  }

  // Simulated payment processor
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  booking.paymentRef = `mock_${crypto.randomBytes(6).toString("hex")}`;
  await booking.save();

  const emailResult = await sendBookingConfirmation({
    to: booking.guest.email,
    booking,
    hotel: booking.hotel,
  });

  res.json({
    success: true,
    data: {
      booking,
      email: emailResult,
    },
  });
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("hotel", "title city country images pricePerNight ratingAverage")
    .sort({ checkIn: -1 });

  res.json({ success: true, data: { bookings } });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("hotel")
    .populate("guest", "name email phone");

  if (!booking) throw new ApiError(404, "Booking not found");

  const isGuest = booking.guest._id.toString() === req.user._id.toString();
  const hostId = booking.hotel?.host?._id || booking.hotel?.host;
  const isHost = hostId?.toString() === req.user._id.toString();

  if (!isGuest && !isHost && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to view this booking");
  }

  res.json({ success: true, data: { booking } });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("hotel");
  if (!booking) throw new ApiError(404, "Booking not found");

  const isGuest = booking.guest.toString() === req.user._id.toString();
  if (!isGuest && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to cancel this booking");
  }

  if (booking.status === "cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  if (booking.status === "completed") {
    throw new ApiError(400, "Completed bookings cannot be cancelled");
  }

  if (new Date(booking.checkIn) <= startOfToday()) {
    throw new ApiError(400, "Cannot cancel a stay that has already started");
  }

  const { refundAmount, refundPercent } = refundForCancel({
    totalPrice: booking.totalPrice,
    checkIn: booking.checkIn,
    policy: booking.cancellationPolicy || booking.hotel?.cancellationPolicy || "moderate",
  });

  booking.status = "cancelled";
  booking.refundAmount = refundAmount;
  if (booking.paymentStatus === "paid" && refundAmount > 0) {
    booking.paymentStatus = refundPercent === 100 ? "refunded" : "paid";
  }
  await booking.save();

  res.json({
    success: true,
    data: {
      booking,
      refund: { refundAmount, refundPercent },
    },
  });
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
