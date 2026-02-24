import express from "express";
import { FacultyController } from "../../controllers/admin/facultyController.js";
import { verifyJWT } from "../../middleware/JWT.js";

const router = express.Router();
const facultyController = new FacultyController();

// get faculty
router.get("/", facultyController.getAllFaculties.bind(facultyController));
router.get(
  "/active",
  facultyController.getActiveFaculties.bind(facultyController)
);
router.get("/:id", facultyController.getFaculty.bind(facultyController));

router.post(
  "/",
  verifyJWT,
  facultyController.createFaculty.bind(facultyController)
);
router.put(
  "/:id",
  verifyJWT,
  facultyController.updateFaculty.bind(facultyController)
);
router.delete(
  "/:id",
  verifyJWT,
  facultyController.deleteFaculty.bind(facultyController)
);

router.post(
  "/restore/:id",
  verifyJWT,
  facultyController.restoreFaculty.bind(facultyController)
);

export default router;
