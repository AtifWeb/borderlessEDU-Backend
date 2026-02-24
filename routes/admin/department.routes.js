import express from "express";
import DepartmentController from "../../controllers/admin/departmentController.js";
import { verifyJWT } from "../../middleware/JWT.js";

const router = express.Router();
const controller = new DepartmentController();

router.get("/", controller.getAllDepartments.bind(controller));
router.get("/:id", controller.getDepartment.bind(controller));

router.post("/", verifyJWT, controller.createDepartment.bind(controller));
router.put("/:id", verifyJWT, controller.updateDepartment.bind(controller));
router.delete("/:id", verifyJWT, controller.deleteDepartment.bind(controller));
router.post(
  "/restore/:id",
  verifyJWT,
  controller.restoreDepartment.bind(controller)
);

export default router;
