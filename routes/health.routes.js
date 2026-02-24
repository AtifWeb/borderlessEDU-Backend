import { Router } from "express";
import { HealthController } from "../controllers/healthController.js";

const router = Router();

const controller = new HealthController();

router.get("/", controller.health.bind(controller));

export default router;
