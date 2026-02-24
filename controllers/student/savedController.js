import { StudentSavedPrograms } from "../../schemas/student/savedPrograms.js";
import { Student } from "../../schemas/student/student.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import mongoose from "mongoose";

export class SavedController {
  // Add a program to student's saved list
  async addSaved(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { program_ref, program_id } = req.body;
      if (!program_ref && !program_id)
        return Response.error(res, "program_ref or program_id required", 400);

      const student = await MongoService.findById(Student, req.user.id);
      if (!student) return Response.error(res, "Student not found", 404);

      let doc = await MongoService.findOne(StudentSavedPrograms, {
        student: req.user.id,
      });

      // normalize program_ref to ObjectId if provided
      const programRefId =
        program_ref && mongoose.Types.ObjectId.isValid(program_ref)
          ? new mongoose.Types.ObjectId(program_ref)
          : null;

      if (!doc) {
        const payload = {
          student: req.user.id,
          programs: [
            {
              program_id: program_id || "",
              program_ref: programRefId,
            },
          ],
        };
        doc = await MongoService.create(StudentSavedPrograms, payload);
        return Response.success(res, "Program saved", {
          saved: true,
          documents: doc,
        });
      }

      // check exists
      const exists = doc.programs.some((p) => {
        if (programRefId && p.program_ref)
          return String(p.program_ref) === String(programRefId);
        if (program_id && p.program_id) return p.program_id === program_id;
        return false;
      });

      if (exists)
        return Response.success(res, "Already saved", { saved: true });

      const entry = { program_id: program_id || "", program_ref: programRefId };
      const updated = await MongoService.updateById(
        StudentSavedPrograms,
        doc._id,
        { $push: { programs: entry } },
        { new: true }
      );
      Response.success(res, "Program saved", {
        saved: true,
        saved_list: updated.programs,
      });
    } catch (err) {
      console.error("Add Saved Error:", err);
      Response.error(res, "Failed to save program", 500);
    }
  }

  // Remove a saved program by program_ref id
  async removeSaved(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { programRef } = req.params;
      if (!programRef) return Response.error(res, "programRef required", 400);

      const doc = await MongoService.findOne(StudentSavedPrograms, {
        student: req.user.id,
      });
      if (!doc) return Response.error(res, "No saved programs found", 404);

      const pullRef = mongoose.Types.ObjectId.isValid(programRef)
        ? new mongoose.Types.ObjectId(programRef)
        : programRef;

      const updated = await StudentSavedPrograms.findByIdAndUpdate(
        doc._id,
        { $pull: { programs: { program_ref: pullRef } } },
        { new: true }
      );

      Response.success(res, "Program removed", {
        saved_list: updated.programs,
      });
    } catch (err) {
      console.error("Remove Saved Error:", err);
      Response.error(res, "Failed to remove saved program", 500);
    }
  }

  // List saved programs for authenticated student
  async listSaved(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const doc = await MongoService.findOneWithPopulate(
        StudentSavedPrograms,
        { student: req.user.id },
        "programs.program_ref"
      );
      if (!doc)
        return Response.success(res, "No saved programs", { saved: [] });
      Response.success(res, "Saved programs retrieved", {
        saved: doc.programs,
      });
    } catch (err) {
      console.error("List Saved Error:", err);
      Response.error(res, "Failed to list saved programs", 500);
    }
  }

  // Check if a program is saved
  async isSaved(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { programRef } = req.params;
      if (!programRef) return Response.error(res, "programRef required", 400);

      const checkRef = mongoose.Types.ObjectId.isValid(programRef)
        ? new mongoose.Types.ObjectId(programRef)
        : programRef;

      const doc = await MongoService.findOne(StudentSavedPrograms, {
        student: req.user.id,
        "programs.program_ref": checkRef,
      });
      const saved = !!doc;
      Response.success(res, "Checked saved", { saved });
    } catch (err) {
      console.error("Is Saved Error:", err);
      Response.error(res, "Failed to check saved program", 500);
    }
  }
}

export default SavedController;
