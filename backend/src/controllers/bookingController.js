import { body } from "express-validator";
import { Booking } from "../models/Booking.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calcTotal, hasBookingOverlap, nightsBetween } from "../utils/booking.js";

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

  const totalPrice = calcTotal({
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
    cleaningFee: hotel.cleaningFee,
    totalPrice,
    specialRequests: specialRequests || "",
    status: "confirmed",
  });

  const populated = await booking.populate([
    { path: "hotel", select: "title city country images pricePerNight" },
    { path: "guest", select: "name email" },
  ]);

  res.status(201).json({ success: true, data: { booking: populated } });
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

  booking.status = "cancelled";
  await booking.save();

  res.json({ success: true, data: { booking } });
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
