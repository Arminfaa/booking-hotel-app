import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator(v) {
            return Array.isArray(v) && v.length === 2;
          },
          message: "coordinates must be [lng, lat]",
        },
      },
    },
    images: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 1,
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      min: 1,
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    beds: {
      type: Number,
      default: 1,
      min: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "cabin", "loft", "hotel"],
      default: "apartment",
    },
    amenities: {
      type: [String],
      default: [],
    },
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "moderate",
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

hotelSchema.index({ location: "2dsphere" });
hotelSchema.index({ city: "text", country: "text", title: "text", description: "text" });

hotelSchema.virtual("smartLocation").get(function smartLocation() {
  return `${this.city}, ${this.country}`;
});

hotelSchema.set("toJSON", { virtuals: true });
hotelSchema.set("toObject", { virtuals: true });

export const Hotel = mongoose.model("Hotel", hotelSchema);
