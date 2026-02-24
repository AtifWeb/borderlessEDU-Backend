import { Router } from "express";
import { AuthController } from "../../controllers/student/authController.js";

const router = Router();

const controller = new AuthController();

router.post("/signup", controller.signUp.bind(controller));
router.post("/signin", controller.signIn.bind(controller));
router.post("/google", controller.googleSignIn.bind(controller));
router.post("/forgot-password", controller.forgotPassword.bind(controller));
router.post("/reset-password", controller.resetPassword.bind(controller));

export default router;
