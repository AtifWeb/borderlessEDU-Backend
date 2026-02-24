import { Router } from "express";
import DocumentsController from "../../controllers/student/documentsController.js";
import verifyJWT from "../../middleware/JWT.js";

const router = Router();
const controller = new DocumentsController();

router.post("/", verifyJWT, controller.createOrAppend.bind(controller));
router.post("/:id/files", verifyJWT, controller.addFiles.bind(controller));
router.delete(
  "/:docId/files/:fileId",
  verifyJWT,
  controller.deleteFile.bind(controller)
);
router.get("/", verifyJWT, controller.listMyDocs.bind(controller));
router.get("/:id", verifyJWT, controller.getDoc.bind(controller));

export default router;
