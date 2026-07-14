import { body } from "express-validator";
import { Conversation, Message } from "../models/Message.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startValidators = [
  body("hotelId").isMongoId(),
  body("body").trim().isLength({ min: 1, max: 2000 }),
];

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    $or: [{ guest: req.user._id }, { host: req.user._id }],
  })
    .populate("hotel", "title images city")
    .populate("guest", "name avatar")
    .populate("host", "name avatar")
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: { conversations } });
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id)
    .populate("hotel", "title images city")
    .populate("guest", "name avatar")
    .populate("host", "name avatar");

  if (!conversation) throw new ApiError(404, "Conversation not found");

  const uid = req.user._id.toString();
  if (
    conversation.guest._id.toString() !== uid &&
    conversation.host._id.toString() !== uid &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not allowed");
  }

  const messages = await Message.find({ conversation: conversation._id })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  res.json({ success: true, data: { conversation, messages } });
});

export const startConversation = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.body.hotelId);
  if (!hotel || !hotel.isPublished) throw new ApiError(404, "Hotel not found");

  if (hotel.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot message yourself");
  }

  let conversation = await Conversation.findOne({
    hotel: hotel._id,
    guest: req.user._id,
    host: hotel.host,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      hotel: hotel._id,
      guest: req.user._id,
      host: hotel.host,
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: req.body.body,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(201).json({
    success: true,
    data: { conversation, message },
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, "Conversation not found");

  const uid = req.user._id.toString();
  if (
    conversation.guest.toString() !== uid &&
    conversation.host.toString() !== uid
  ) {
    throw new ApiError(403, "Not allowed");
  }

  const bodyText = String(req.body.body || "").trim();
  if (!bodyText) throw new ApiError(400, "Message body is required");

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    body: bodyText,
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populated = await message.populate("sender", "name avatar");
  res.status(201).json({ success: true, data: { message: populated } });
});
