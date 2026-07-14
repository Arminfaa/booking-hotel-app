import { Booking } from "../models/Booking.js";

const ACTIVE_STATUSES = ["pending", "confirmed"];

export function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export async function hasBookingOverlap(hotelId, checkIn, checkOut, excludeId) {
  const query = {
    hotel: hotelId,
    status: { $in: ACTIVE_STATUSES },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  const conflict = await Booking.findOne(query).select("_id");
  return Boolean(conflict);
}

export function calcTotal({ pricePerNight, cleaningFee = 0, nights }) {
  return pricePerNight * nights + cleaningFee;
}
