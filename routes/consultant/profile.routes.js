import { Router } from "express";
import { ProfileController } from "../../controllers/consultant/profileController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();

const controller = new ProfileController();

router.get(
  "/getprofile/:email",
  verifyJWT,
  controller.getProfileByEmail.bind(controller)
);
router.post(
  "/updateprofile",
  verifyJWT,
  controller.updateProfileByEmail.bind(controller)
);

export default router;
