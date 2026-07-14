import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      adults: { type: Number, required: true, min: 1, default: 1 },
      children: { type: Number, min: 0, default: 0 },
    },
    nights: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    cleaningFee: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    specialRequests: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });

bookingSchema.pre("validate", function validateDates(next) {
  if (this.checkOut <= this.checkIn) {
    next(new Error("Check-out must be after check-in"));
    return;
  }
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
