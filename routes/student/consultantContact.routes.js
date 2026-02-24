import { Router } from "express";
import ConsultantContactController from "../../controllers/student/consultantContactController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new ConsultantContactController();

router.post("/", verifyJWT, controller.contactConsultant.bind(controller));
router.get("/", verifyJWT, controller.listMyContacts.bind(controller));
router.get("/:id", verifyJWT, controller.getContact.bind(controller));

export default router;
