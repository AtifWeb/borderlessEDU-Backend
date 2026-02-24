import express from "express";
import ApplicationController from "../../controllers/student/applicationController.js";
import { verifyJWT } from "../../middleware/JWT.js";

const router = express.Router();
const controller = new ApplicationController();

router.post("/", verifyJWT, controller.createApplication.bind(controller));
router.get("/", verifyJWT, controller.getMyApplications.bind(controller));
router.get("/:id", verifyJWT, controller.getApplication.bind(controller));
router.delete("/:id", verifyJWT, controller.deleteApplication.bind(controller));

export default router;
