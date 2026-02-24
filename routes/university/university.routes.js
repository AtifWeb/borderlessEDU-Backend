import { Router } from "express";
import UniversityController from "../../controllers/univesity/universityController.js";
import { verifyJWT } from "../../middleware/JWT.js";
import { verifyAdmin } from "../../middleware/admin.js";

const router = Router();
const controller = new UniversityController();

// List universities - consultants see their own, admins see all
router.get("/", verifyJWT, controller.list.bind(controller));

// Get university by ID - consultants see their own, admins see all
router.get("/:id", verifyJWT, controller.getById.bind(controller));

// Create university - only consultants
router.post("/", verifyJWT, controller.create.bind(controller));

// Update university - only consultants can update their own
router.put("/:id", verifyJWT, controller.update.bind(controller));

// Delete university - only consultants can delete their own
router.delete("/:id", verifyJWT, controller.remove.bind(controller));

export default router;
