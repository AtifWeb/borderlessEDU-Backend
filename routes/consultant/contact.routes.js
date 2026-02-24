import { Router } from "express";
import ConsultantContactController from "../../controllers/consultant/consultantContactController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new ConsultantContactController();

router.get("/", verifyJWT, controller.listContacts.bind(controller));
router.get("/:id", verifyJWT, controller.getContact.bind(controller));
router.post("/:id/respond", verifyJWT, controller.respond.bind(controller));

export default router;
