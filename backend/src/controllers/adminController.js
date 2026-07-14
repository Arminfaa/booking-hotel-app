import { User } from "../models/User.js";
import { Hotel } from "../models/Hotel.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const overview = asyncHandler(async (_req, res) => {
  const [users, hotels, bookings, revenue] = await Promise.all([
    User.countDocuments(),
    Hotel.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      users,
      hotels,
      bookings,
      revenue: revenue[0]?.total || 0,
    },
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select("-password");
  res.json({
    success: true,
    data: { users: users.map((u) => u.toSafeJSON()) },
  });
});

export const listHotelsAdmin = asyncHandler(async (_req, res) => {
  const hotels = await Hotel.find().populate("host", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: { hotels } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const allowed = ["role", "name"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { user: user.toSafeJSON() } });
});

export const updateHotelAdmin = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.isPublished !== undefined
        ? { isPublished: req.body.isPublished }
        : {}),
      ...(req.body.title ? { title: req.body.title } : {}),
    },
    { new: true, runValidators: true }
  );
  if (!hotel) throw new ApiError(404, "Hotel not found");
  res.json({ success: true, data: { hotel } });
});
