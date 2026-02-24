import { Router } from "express";
import { EmailController } from "../../controllers/global/EmailController.js";

const router = Router();

const controller = new EmailController();

// POST /global/email/contact-support
router.post("/contact-support", controller.contactSupport.bind(controller));
router.post(
  "/send-delete-application",
  controller.sendDeleteApplication.bind(controller),
);
router.post(
  "/send-booking-confirmation",
  controller.sendBookingConfirmation.bind(controller),
);
router.post(
  "/send-message-notification",
  controller.sendMessageNotification.bind(controller),
);

export default router;
