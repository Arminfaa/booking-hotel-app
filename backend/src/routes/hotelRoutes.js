import { Router } from "express";
import {
  checkAvailability,
  createHotel,
  createHotelValidators,
  deleteHotel,
  getHotel,
  hotelCalendar,
  idParam,
  listHotelValidators,
  listHotels,
  myHotels,
  updateHotel,
} from "../controllers/hotelController.js";
import {
  createReview,
  createReviewValidators,
  deleteReview,
  listReviews,
} from "../controllers/reviewController.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listHotelValidators, validate, listHotels);
router.get("/mine/list", protect, authorize("host", "admin"), myHotels);
router.get("/:id", optionalAuth, idParam, validate, getHotel);
router.get("/:id/availability", idParam, validate, checkAvailability);
router.get("/:id/calendar", idParam, validate, hotelCalendar);
router.get("/:id/reviews", idParam, validate, listReviews);

router.post(
  "/",
  protect,
  authorize("host", "admin"),
  createHotelValidators,
  validate,
  createHotel
);
router.patch("/:id", protect, authorize("host", "admin"), idParam, validate, updateHotel);
router.delete("/:id", protect, authorize("host", "admin"), idParam, validate, deleteHotel);

router.post(
  "/:id/reviews",
  protect,
  idParam,
  createReviewValidators,
  validate,
  createReview
);
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  idParam,
  validate,
  deleteReview
);

export default router;
