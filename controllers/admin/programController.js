import { Program } from "../../schemas/admin/program.js";
import { DeletedProgram } from "../../schemas/admin/deletedProgram.js";
import { ProgramJoi } from "../../validation/program.js";
import { Response } from "../../utils/Response.js";
import { PROGRAM } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";
import { Helper } from "../../utils/Helper.js";

export class ProgramController {
  // Add new program
  async addProgram(req, res) {
    try {
      // Ensure authenticated user exists and set created_by
      if (!req.user?.id) {
        return Response.error(res, PROGRAM.general.unauthorized, 401);
      }

      req.body.information.created_by = req.user.id;

      // Validate request body
      const { error, value } = ProgramJoi.createSchema().validate(req.body);

      console.log(error);

      if (error) {
        return Response.error(res, PROGRAM.general.validation_error, 400);
      }

      const existingProgram = await MongoService.findOne(Program, {
        "information.id": value.information.id,
      });

      if (existingProgram) {
        return Response.error(res, PROGRAM.messages.id_exists, 400);
      }

      // Create program
      const program = await MongoService.create(Program, value);

      Response.success(res, PROGRAM.messages.create_success, {
        id: program._id,
        program_id: program.information.id,
        name: program.information.name,
        status: program.information.status,
        created_at: program.createdAt,
      });
    } catch (err) {
      console.error("Add Program Error:", err);
      Response.error(res, PROGRAM.general.create_failed, 500);
    }
  }

  // Update program
  async updateProgram(req, res) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = ProgramJoi.updateSchema().validate(req.body);
      if (error) {
        return Response.error(res, PROGRAM.general.validation_error, 400);
      }

      // Find program
      const existingProgram = await MongoService.findById(Program, id);
      if (!existingProgram) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }

      // Check if updating program ID, ensure it's unique
      if (
        value.information?.id &&
        value.information.id !== existingProgram.information.id
      ) {
        const programWithSameId = await MongoService.findOne(Program, {
          "information.id": value.information.id,
          _id: { $ne: id },
        });

        if (programWithSameId) {
          return Response.error(res, PROGRAM.messages.id_exists, 400);
        }
      }

      // Add last_updated_by
      value.last_updated_by = req.user.id;

      // Update program
      const updatedProgram = await MongoService.updateById(Program, id, value);

      Response.success(res, PROGRAM.messages.update_success, {
        id: updatedProgram._id,
        program_id: updatedProgram.information.id,
        name: updatedProgram.information.name,
        status: updatedProgram.information.status,
        updated_at: updatedProgram.updatedAt,
      });
    } catch (err) {
      console.error("Update Program Error:", err);
      Response.error(res, PROGRAM.general.update_failed, 500);
    }
  }

  // Delete program (soft delete)
  async deleteProgram(req, res) {
    try {
      const { id } = req.params;

      // Find program
      const program = await MongoService.findById(Program, id);
      if (!program) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }
      // Move program to DeletedProgram collection with deletion metadata
      const doc = program.toObject();
      const deletedDoc = {
        original_program_id: doc._id,
        ...doc,
        deleted_by: req.user?.id || null,
        deleted_at: new Date(),
      };

      // Create record in DeletedProgram
      const createdDeleted = await MongoService.create(
        DeletedProgram,
        deletedDoc,
      );

      // Remove the original program from Program collection
      await MongoService.deleteById(Program, id);

      Response.success(res, PROGRAM.messages.delete_success, {
        id: createdDeleted._id,
        program_id: createdDeleted.information?.id || null,
        name: createdDeleted.information?.name || null,
        status: createdDeleted.information?.status || "archived",
      });
    } catch (err) {
      console.error("Delete Program Error:", err);
      Response.error(res, PROGRAM.general.delete_failed, 500);
    }
  }

  // Get program by ID
  async getProgram(req, res) {
    try {
      const { id } = req.params;

      const program = await MongoService.findOne(Program, {
        _id: id,
      });

      if (!program) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }

      // Format response
      const formattedProgram = Helper._formatProgramResponse(program);

      Response.success(res, PROGRAM.messages.fetch_success, {
        program: formattedProgram,
      });
    } catch (err) {
      console.error("Get Program Error:", err);
      Response.error(res, PROGRAM.general.fetch_failed, 500);
    }
  }

  // Get all programs with filtering and pagination
  async getAllPrograms(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        program_type,
        faculty,
        search,
        sort_by = "createdAt",
        sort_order = "desc",
      } = req.query;

      // Build filter
      const filter = {};

      if (status) {
        filter["information.status"] = status;
      }

      if (program_type) {
        filter["information.program_type"] = program_type;
      }

      if (faculty) {
        filter["faculty.faculty"] = { $regex: faculty, $options: "i" };
      }

      if (search) {
        filter.$or = [
          { "information.name": { $regex: search, $options: "i" } },
          { "information.id": { $regex: search, $options: "i" } },
          { "details.description": { $regex: search, $options: "i" } },
        ];
      }

      // Build sort
      const sort = {};
      sort[sort_by] = sort_order === "asc" ? 1 : -1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get programs with pagination
      const programs = await MongoService.find(Program, filter, null, {
        skip,
        limit: parseInt(limit),
        sort,
      });

      // Get total count
      const total = await MongoService.count(Program, filter);

      // Format programs
      const formattedPrograms = programs.map((program) =>
        Helper._formatProgramResponse(program),
      );

      Response.success(res, PROGRAM.messages.fetch_all_success, {
        programs: formattedPrograms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      console.error("Get All Programs Error:", err);
      Response.error(res, PROGRAM.general.fetch_all_failed, 500);
    }
  }

  // Get active intakes for a program
  async getProgramIntakes(req, res) {
    try {
      const { id } = req.params;

      const program = await MongoService.findById(Program, id);
      if (!program || !program.is_active) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }

      const activeIntakes = program.intakes.filter(
        (intake) => intake.is_active && intake.status === "upcoming",
      );

      Response.success(res, PROGRAM.messages.intakes_fetch_success, {
        program_id: program._id,
        program_name: program.information.name,
        intakes: activeIntakes,
      });
    } catch (err) {
      console.error("Get Intakes Error:", err);
      Response.error(res, PROGRAM.messages.intakes_fetch_failed, 500);
    }
  }

  // Update program status
  async updateProgramStatus(req, res) {
    try {
      const { id } = req.params || {};
      const status = req.body?.status;

      // Validate status presence
      const validStatuses = ["active", "inactive", "draft", "archived"];
      if (!status || !validStatuses.includes(status)) {
        return Response.error(res, PROGRAM.messages.invalid_status, 400);
      }

      const program = await MongoService.findById(Program, id);
      if (!program) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }

      const userId = req.user?.id || null;

      const updatedProgram = await MongoService.updateById(Program, id, {
        "information.status": status,
        last_updated_by: userId,
      });

      Response.success(res, PROGRAM.messages.status_update_success, {
        id: updatedProgram._id,
        name: updatedProgram.information.name,
        status: updatedProgram.information.status,
      });
    } catch (err) {
      console.error("Update Status Error:", err);
      Response.error(res, PROGRAM.messages.status_update_failed, 500);
    }
  }

  // Restore a deleted program from DeletedProgram collection
  async restoreProgram(req, res) {
    try {
      const { id } = req.params; // id of DeletedProgram document

      const deletedDoc = await MongoService.findById(DeletedProgram, id);
      if (!deletedDoc) {
        return Response.error(res, PROGRAM.general.not_found, 404);
      }

      const doc = deletedDoc.toObject();

      // Check for existing program with same information.id
      if (doc.information?.id) {
        const existing = await MongoService.findOne(Program, {
          "information.id": doc.information.id,
        });
        if (existing) {
          return Response.error(res, PROGRAM.messages.id_exists, 400);
        }
      }

      // Prepare program data to re-insert
      const programData = { ...doc };
      // Remove fields not part of Program schema
      delete programData._id;
      delete programData.original_program_id;
      delete programData.deleted_by;
      delete programData.deleted_at;
      delete programData.createdAt;
      delete programData.updatedAt;
      delete programData.__v;

      // Restore with original id if available
      if (doc.original_program_id) {
        programData._id = doc.original_program_id;
      }

      // Ensure `information.created_by` exists (required by Program schema)
      programData.information = programData.information || {};
      const createdBy =
        doc.information?.created_by || doc.deleted_by || req.user?.id;
      if (!createdBy) {
        return Response.error(
          res,
          "Cannot restore program: missing created_by information",
          400,
        );
      }
      programData.information.created_by = createdBy;

      const restored = await MongoService.create(Program, programData);

      // Remove the record from DeletedProgram
      await MongoService.deleteById(DeletedProgram, id);

      Response.success(res, PROGRAM.messages.create_success, {
        id: restored._id,
        program_id: restored.information?.id,
        name: restored.information?.name,
        status: restored.information?.status,
      });
    } catch (err) {
      console.error("Restore Program Error:", err);
      Response.error(res, PROGRAM.general.server_error, 500);
    }
  }
}
