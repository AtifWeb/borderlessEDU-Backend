import { Router } from "express";
import { OtpController } from "../../controllers/global/OtpController.js";

const router = Router();

const controller = new OtpController();

router.post("/send", controller.sendOtp.bind(controller));
router.post("/verify", controller.verifyOtp.bind(controller));

export default router;
