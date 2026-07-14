import { Booking } from "../models/Booking.js";

const ACTIVE_STATUSES = ["pending", "confirmed"];

export async function hasBookingOverlap(hotelId, checkIn, checkOut, excludeId) {
  const query = {
    hotel: hotelId,
    status: { $in: ACTIVE_STATUSES },
    paymentStatus: { $ne: "unpaid" }, // unpaid pending shouldn't block? Actually pending unpaid should still block temporarily
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  // Block both unpaid and paid active reservations to prevent double booking
  delete query.paymentStatus;
  if (excludeId) query._id = { $ne: excludeId };
  const conflict = await Booking.findOne(query).select("_id");
  return Boolean(conflict);
}
