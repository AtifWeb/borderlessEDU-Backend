import express from "express";
import ApplicationAdminController from "../../controllers/admin/applicationAdminController.js";
import { verifyJWT } from "../../middleware/JWT.js";

const router = express.Router();
const controller = new ApplicationAdminController();

router.get("/", verifyJWT, controller.listApplications.bind(controller));
router.get("/:id", verifyJWT, controller.getApplication.bind(controller));
const allowAdminOrConsultant = (req, res, next) => {
  const role = req.user?.role || req.user?.role;
  if (!role)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const r = typeof role === "string" ? role.toLowerCase() : "";
  if (r === "admin" || r === "consultant") return next();
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.patch(
  "/:id/status",
  verifyJWT,
  allowAdminOrConsultant,
  controller.updateStatus.bind(controller),
);

export default router;
