import { Router } from "express";
import ConsultantBookingController from "../../controllers/consultant/bookingController.js";
import { verifyJWT } from "../../middleware/JWT.js";
import { verifyAdmin } from "../../middleware/admin.js";

const router = Router();
const controller = new ConsultantBookingController();

// create booking (student)
router.post("/", verifyJWT, controller.createBooking.bind(controller));

// list bookings (consultant or student)
router.get("/", verifyJWT, controller.listBookings.bind(controller));

// get bookings by month for analytics
router.get(
  "/analytics/monthly",
  verifyJWT,
  controller.getBookingsByMonth.bind(controller),
);

// get booking
router.get("/:id", verifyJWT, controller.getBooking.bind(controller));

// update booking (admin only)
router.put(
  "/:id",
  verifyJWT,
  verifyAdmin,
  controller.updateBooking.bind(controller),
);

// delete booking (admin only)
router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  controller.deleteBooking.bind(controller),
);

export default router;
