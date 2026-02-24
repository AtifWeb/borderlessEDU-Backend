import { Router } from "express";
import { AuthController } from "../../controllers/admin/authController.js";

const router = Router();

const controller = new AuthController();

router.post("/signup", controller.signUp.bind(controller));
router.post("/signin", controller.signIn.bind(controller));

export default router;
