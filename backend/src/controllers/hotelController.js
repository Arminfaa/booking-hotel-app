import { query, body, param } from "express-validator";
import { Hotel } from "../models/Hotel.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasBookingOverlap } from "../utils/booking.js";

export const listHotelValidators = [
  query("city").optional().trim(),
  query("q").optional().trim(),
  query("guests").optional().isInt({ min: 1 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("propertyType").optional().isString(),
  query("checkIn").optional().isISO8601(),
  query("checkOut").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
];

export const createHotelValidators = [
  body("title").trim().notEmpty(),
  body("description").trim().notEmpty(),
  body("city").trim().notEmpty(),
  body("country").trim().notEmpty(),
  body("address").trim().notEmpty(),
  body("longitude").isFloat({ min: -180, max: 180 }),
  body("latitude").isFloat({ min: -90, max: 90 }),
  body("images").isArray({ min: 1 }),
  body("pricePerNight").isFloat({ min: 1 }),
  body("maxGuests").isInt({ min: 1 }),
];

export const listHotels = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };

  if (req.query.city) {
    filter.city = new RegExp(`^${escapeRegex(req.query.city)}$`, "i");
  }

  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  if (req.query.guests) {
    filter.maxGuests = { $gte: Number(req.query.guests) };
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.pricePerNight = {};
    if (req.query.minPrice) filter.pricePerNight.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.pricePerNight.$lte = Number(req.query.maxPrice);
  }

  if (req.query.propertyType) {
    filter.propertyType = req.query.propertyType;
  }

  if (req.query.checkIn && req.query.checkOut) {
    const checkIn = new Date(req.query.checkIn);
    const checkOut = new Date(req.query.checkOut);
    const busy = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    }).distinct("hotel");
    filter._id = { $nin: busy };
  }

  const [hotels, total] = await Promise.all([
    Hotel.find(filter)
      .populate("host", "name avatar")
      .sort(req.query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Hotel.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      hotels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id).populate("host", "name avatar phone createdAt");
  if (!hotel || !hotel.isPublished) {
    throw new ApiError(404, "Hotel not found");
  }
  res.json({ success: true, data: { hotel } });
});

export const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    throw new ApiError(400, "checkIn and checkOut are required");
  }
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const available = !(await hasBookingOverlap(hotel._id, checkIn, checkOut));
  res.json({ success: true, data: { available } });
});

export const createHotel = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    city,
    country,
    address,
    longitude,
    latitude,
    images,
    pricePerNight,
    cleaningFee,
    maxGuests,
    bedrooms,
    beds,
    bathrooms,
    propertyType,
    amenities,
  } = req.body;

  const hotel = await Hotel.create({
    title,
    description,
    city,
    country,
    address,
    location: { type: "Point", coordinates: [longitude, latitude] },
    images,
    pricePerNight,
    cleaningFee,
    maxGuests,
    bedrooms,
    beds,
    bathrooms,
    propertyType,
    amenities,
    host: req.user._id,
  });

  res.status(201).json({ success: true, data: { hotel } });
});

export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const isOwner = hotel.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to update this hotel");
  }

  const fields = [
    "title",
    "description",
    "city",
    "country",
    "address",
    "images",
    "pricePerNight",
    "cleaningFee",
    "maxGuests",
    "bedrooms",
    "beds",
    "bathrooms",
    "propertyType",
    "amenities",
    "isPublished",
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) hotel[field] = req.body[field];
  }

  if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
    hotel.location = {
      type: "Point",
      coordinates: [Number(req.body.longitude), Number(req.body.latitude)],
    };
  }

  await hotel.save();
  res.json({ success: true, data: { hotel } });
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const isOwner = hotel.host.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to delete this hotel");
  }

  await hotel.deleteOne();
  res.json({ success: true, message: "Hotel deleted" });
});

export const idParam = [param("id").isMongoId().withMessage("Invalid hotel id")];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
