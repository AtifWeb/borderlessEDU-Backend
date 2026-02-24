import { Router } from "express";
import StudentAdminController from "../../controllers/admin/studentAdminController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new StudentAdminController();

router.get("/", verifyJWT, controller.listStudents.bind(controller));
router.get("/:id", verifyJWT, controller.getStudent.bind(controller));

export default router;
