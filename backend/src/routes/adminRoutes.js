import { Router } from "express";
import {
  listHotelsAdmin,
  listUsers,
  overview,
  updateHotelAdmin,
  updateUser,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/overview", overview);
router.get("/users", listUsers);
router.get("/hotels", listHotelsAdmin);
router.patch("/users/:id", updateUser);
router.patch("/hotels/:id", updateHotelAdmin);

export default router;
