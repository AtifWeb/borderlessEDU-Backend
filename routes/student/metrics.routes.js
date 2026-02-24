import { Router } from "express";
import MetricsController from "../../controllers/student/metricsController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new MetricsController();

// GET student metrics
router.get("/", verifyJWT, controller.getMetrics.bind(controller));

export default router;
