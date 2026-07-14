import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Hotel } from "../models/Hotel.js";
import { Booking } from "../models/Booking.js";
import { Review } from "../models/Review.js";
import { Bookmark } from "../models/Bookmark.js";
import { seedHotels, seedUsers } from "./data.js";
import { calcTotal, nightsBetween } from "../utils/booking.js";

async function seed() {
  await connectDB();

  console.log("Clearing collections...");
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Bookmark.deleteMany({}),
  ]);

  console.log("Creating users...");
  const users = [];
  for (const u of seedUsers) {
    users.push(await User.create(u));
  }
  const host = users.find((u) => u.role === "host");
  const guest = users.find((u) => u.role === "guest");

  console.log("Creating hotels...");
  const hotels = [];
  for (const h of seedHotels) {
    const { longitude, latitude, ...rest } = h;
    hotels.push(
      await Hotel.create({
        ...rest,
        location: { type: "Point", coordinates: [longitude, latitude] },
        host: host._id,
      })
    );
  }

  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 14);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3);
  const nights = nightsBetween(checkIn, checkOut);
  const sampleHotel = hotels[0];

  const booking = await Booking.create({
    hotel: sampleHotel._id,
    guest: guest._id,
    checkIn,
    checkOut,
    guests: { adults: 2, children: 0 },
    nights,
    pricePerNight: sampleHotel.pricePerNight,
    cleaningFee: sampleHotel.cleaningFee,
    totalPrice: calcTotal({
      pricePerNight: sampleHotel.pricePerNight,
      cleaningFee: sampleHotel.cleaningFee,
      nights,
    }),
    status: "confirmed",
    specialRequests: "Late check-in around 9pm",
  });

  await Bookmark.create({
    user: guest._id,
    hotel: hotels[1]._id,
    note: "Weekend trip idea",
  });

  const review = await Review.create({
    hotel: hotels[1]._id,
    user: guest._id,
    rating: 5,
    comment: "Beautifully kept space with an unforgettable sunset view.",
  });

  await Hotel.findByIdAndUpdate(hotels[1]._id, {
    ratingAverage: 5,
    ratingCount: 1,
  });

  console.log("Seed complete.");
  console.log({
    users: users.map((u) => ({ email: u.email, password: "password123", role: u.role })),
    hotels: hotels.length,
    sampleBooking: booking._id.toString(),
    sampleReview: review._id.toString(),
  });

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
