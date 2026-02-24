import { Router } from "express";
import StudentMessageController from "../../controllers/student/messageController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new StudentMessageController();

router.post("/", verifyJWT, controller.sendMessage.bind(controller));
router.get("/rooms", verifyJWT, controller.listConversations.bind(controller));
router.get(
  "/room/:id/messages",
  verifyJWT,
  controller.getRoomMessages.bind(controller)
);

export default router;
