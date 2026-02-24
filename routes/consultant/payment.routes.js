import express, { Router } from "express";
import ConsultantPaymentController from "../../controllers/consultant/paymentController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new ConsultantPaymentController();

router.post("/trial", verifyJWT, controller.startTrial.bind(controller));
router.post(
  "/checkout-session",
  verifyJWT,
  controller.createCheckoutSession.bind(controller)
);
router.post(
  "/setup-intent",
  verifyJWT,
  controller.createSetupIntent.bind(controller)
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  controller.webhook.bind(controller)
); // stripe webhook (raw body required)
router.get("/status", verifyJWT, controller.status.bind(controller));

export default router;
