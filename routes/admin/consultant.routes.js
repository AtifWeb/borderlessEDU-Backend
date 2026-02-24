import { Router } from "express";
import ConsultantAdminController from "../../controllers/admin/consultantAdminController.js";
import { verifyJWT } from "../../middleware/JWT.js";
import { verifyAdmin } from "../../middleware/admin.js";

const router = Router();
const controller = new ConsultantAdminController();

router.get("/", controller.listConsultants.bind(controller));
router.get("/:id", controller.getConsultant.bind(controller));
router.put(
  "/:id",
  verifyJWT,
  verifyAdmin,
  controller.updateConsultant.bind(controller),
);
router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  controller.deleteConsultant.bind(controller),
);

export default router;
