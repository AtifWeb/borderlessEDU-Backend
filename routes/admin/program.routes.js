import express from "express";
import { ProgramController } from "../../controllers/admin/programController.js";
import { verifyJWT } from "../../middleware/JWT.js";

const router = express.Router();
const programController = new ProgramController();

router.get("/", programController.getAllPrograms.bind(programController));
router.get("/:id", programController.getProgram.bind(programController));

// posting the program
router.post(
  "/",
  verifyJWT,
  programController.addProgram.bind(programController),
);

// updating the program
router.put(
  "/:id",
  verifyJWT,
  programController.updateProgram.bind(programController),
);

// deleting the program
router.delete(
  "/:id",
  verifyJWT,
  programController.deleteProgram.bind(programController),
);

// updating the status
router.patch(
  "/:id/status",
  verifyJWT,
  programController.updateProgramStatus.bind(programController),
);

// restore deleted program
router.post(
  "/restore/:id",
  verifyJWT,
  programController.restoreProgram.bind(programController),
);

export default router;
