import { Router } from "express";
import SavedController from "../../controllers/student/savedController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new SavedController();

router.post("/", verifyJWT, controller.addSaved.bind(controller));
router.get("/", verifyJWT, controller.listSaved.bind(controller));
router.get(
  "/:programRef/check",
  verifyJWT,
  controller.isSaved.bind(controller)
);
router.delete(
  "/:programRef",
  verifyJWT,
  controller.removeSaved.bind(controller)
);

export default router;
