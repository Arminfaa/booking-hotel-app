import { Router } from "express";
import {
  cancelBooking,
  createBooking,
  createBookingValidators,
  getBooking,
  myBookings,
  payBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/me", myBookings);
router.post("/", createBookingValidators, validate, createBooking);
router.get("/:id", getBooking);
router.post("/:id/pay", payBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
