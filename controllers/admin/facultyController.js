import { Faculty } from "../../schemas/admin/faculty.js";
import { DeletedFaculty } from "../../schemas/admin/deletedFaculty.js";
import { FacultyJoi } from "../../validation/faculty/faculty.js";
import { Response } from "../../utils/Response.js";
import { FACULTY } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";

export class FacultyController {
  // Create faculty
  async createFaculty(req, res) {
    try {
      // Validate request
      const { error, value } = FacultyJoi.createSchema().validate(req.body);
      if (error) {
        return Response.error(res, error.details[0].message, 400);
      }

      // Check if faculty code already exists
      const existingCode = await MongoService.findOne(Faculty, {
        code: value.code,
      });
      if (existingCode) {
        return Response.error(res, FACULTY.messages.code_exists, 400);
      }

      // Check if faculty name already exists
      const existingName = await MongoService.findOne(Faculty, {
        name: { $regex: new RegExp(`^${value.name}$`, "i") },
      });

      if (existingName) {
        return Response.error(res, FACULTY.messages.name_exists, 400);
      }

      // Add created_by from authenticated user
      // value.created_by = req.user.id;

      // Create faculty
      const faculty = await MongoService.create(Faculty, value);

      Response.success(res, FACULTY.messages.create_success, {
        id: faculty._id,
        name: faculty.name,
        code: faculty.code,
        is_active: faculty.is_active,
        created_at: faculty.createdAt,
      });
    } catch (err) {
      console.error("Create Faculty Error:", err);
      Response.error(res, FACULTY.messages.create_failed, 500);
    }
  }

  // Get all faculties
  async getAllFaculties(req, res) {
    try {
      // Validate query params
      const { error, value } = FacultyJoi.querySchema().validate(req.query);
      if (error) {
        return Response.error(res, error.details[0].message, 400);
      }

      const { page, limit, search, is_active, sort_by, sort_order } = value;

      // Build filter
      const filter = {};

      if (is_active !== undefined) {
        filter.is_active = is_active;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort
      const sort = {};
      sort[sort_by] = sort_order === "asc" ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get faculties
      const faculties = await MongoService.find(Faculty, filter, null, {
        skip,
        limit,
        sort,
      });

      // Get total count
      const total = await MongoService.count(Faculty, filter);

      // Format response
      const formattedFaculties = faculties.map((faculty) => ({
        id: faculty._id,
        name: faculty.name,
        code: faculty.code,
        description: faculty.description,
        contact_email: faculty.contact_email,
        website: faculty.website,
        is_active: faculty.is_active,
        created_at: faculty.createdAt,
        updated_at: faculty.updatedAt,
      }));

      Response.success(res, FACULTY.messages.fetch_all_success, {
        faculties: formattedFaculties,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get All Faculties Error:", err);
      Response.error(res, FACULTY.messages.fetch_all_failed, 500);
    }
  }

  // Get faculty by ID
  async getFaculty(req, res) {
    try {
      const { id } = req.params;

      const faculty = await MongoService.findById(Faculty, id);
      if (!faculty) {
        return Response.error(res, FACULTY.messages.not_found, 404);
      }

      // Populate dean details if needed
      const populatedFaculty = await MongoService.findOneWithPopulate(
        Faculty,
        { _id: id },
        {
          path: "dean",
          select: "name email",
        }
      );

      Response.success(res, FACULTY.messages.fetch_success, {
        faculty: {
          id: populatedFaculty._id,
          name: populatedFaculty.name,
          code: populatedFaculty.code,
          description: populatedFaculty.description,
          dean: populatedFaculty.dean
            ? {
                id: populatedFaculty.dean._id,
                name: populatedFaculty.dean.name,
                email: populatedFaculty.dean.email,
              }
            : null,
          contact_email: populatedFaculty.contact_email,
          website: populatedFaculty.website,
          is_active: populatedFaculty.is_active,
          created_at: populatedFaculty.createdAt,
          updated_at: populatedFaculty.updatedAt,
        },
      });
    } catch (err) {
      console.error("Get Faculty Error:", err);
      Response.error(res, FACULTY.messages.fetch_failed, 500);
    }
  }

  // Update faculty
  async updateFaculty(req, res) {
    try {
      const { id } = req.params;

      // Validate request
      const { error, value } = FacultyJoi.updateSchema().validate(req.body);
      if (error) {
        return Response.error(res, error.details[0].message, 400);
      }

      // Find faculty
      const existingFaculty = await MongoService.findById(Faculty, id);
      if (!existingFaculty) {
        return Response.error(res, FACULTY.messages.not_found, 404);
      }

      // Check if updating code, ensure it's unique
      if (value.code && value.code !== existingFaculty.code) {
        const facultyWithSameCode = await MongoService.findOne(Faculty, {
          code: value.code,
          _id: { $ne: id },
        });
        if (facultyWithSameCode) {
          return Response.error(res, FACULTY.messages.code_exists, 400);
        }
      }

      // Check if updating name, ensure it's unique
      if (value.name && value.name !== existingFaculty.name) {
        const facultyWithSameName = await MongoService.findOne(Faculty, {
          name: { $regex: new RegExp(`^${value.name}$`, "i") },
          _id: { $ne: id },
        });
        if (facultyWithSameName) {
          return Response.error(res, FACULTY.messages.name_exists, 400);
        }
      }

      // Update faculty
      const updatedFaculty = await MongoService.updateById(Faculty, id, value);

      Response.success(res, FACULTY.messages.update_success, {
        id: updatedFaculty._id,
        name: updatedFaculty.name,
        code: updatedFaculty.code,
        is_active: updatedFaculty.is_active,
        updated_at: updatedFaculty.updatedAt,
      });
    } catch (err) {
      console.error("Update Faculty Error:", err);
      Response.error(res, FACULTY.messages.update_failed, 500);
    }
  }

  // Delete faculty (soft delete)
  async deleteFaculty(req, res) {
    try {
      const { id } = req.params;

      // Find faculty
      const faculty = await MongoService.findById(Faculty, id);
      if (!faculty) {
        return Response.error(res, FACULTY.messages.not_found, 404);
      }

      // Move faculty to DeletedFaculty collection with deletion metadata
      const doc = faculty.toObject();
      const deletedDoc = {
        original_faculty_id: doc._id,
        name: doc.name,
        code: doc.code,
        description: doc.description,
        contact_email: doc.contact_email,
        website: doc.website,
        dean: doc.dean,
        is_active: doc.is_active,
        created_by: doc.created_by,
        deleted_by: req.user?.id || null,
        deleted_at: new Date(),
      };

      const createdDeleted = await MongoService.create(
        DeletedFaculty,
        deletedDoc
      );

      // Remove original faculty
      await MongoService.deleteById(Faculty, id);

      Response.success(res, FACULTY.messages.delete_success, {
        id: createdDeleted._id,
        name: createdDeleted.name,
        code: createdDeleted.code,
        is_active: false,
      });
    } catch (err) {
      console.error("Delete Faculty Error:", err);
      Response.error(res, FACULTY.messages.delete_failed, 500);
    }
  }

  // Restore a deleted faculty from DeletedFaculty collection
  async restoreFaculty(req, res) {
    try {
      const { id } = req.params; // id of DeletedFaculty doc

      const deletedDoc = await MongoService.findById(DeletedFaculty, id);
      if (!deletedDoc) {
        return Response.error(res, FACULTY.messages.not_found, 404);
      }

      const doc = deletedDoc.toObject();

      // Check for existing faculty with same code
      if (doc.code) {
        const existing = await MongoService.findOne(Faculty, {
          code: doc.code,
        });
        if (existing) {
          return Response.error(res, FACULTY.messages.code_exists, 400);
        }
      }

      // Prepare faculty data
      const facultyData = {
        name: doc.name,
        code: doc.code,
        description: doc.description,
        contact_email: doc.contact_email,
        website: doc.website,
        dean: doc.dean,
        is_active: doc.is_active,
        created_by: doc.created_by || req.user?.id,
      };

      // If original id exists, try to preserve it
      if (doc.original_faculty_id) {
        facultyData._id = doc.original_faculty_id;
      }

      const restored = await MongoService.create(Faculty, facultyData);

      // Remove from DeletedFaculty
      await MongoService.deleteById(DeletedFaculty, id);

      Response.success(res, FACULTY.messages.create_success, {
        id: restored._id,
        name: restored.name,
        code: restored.code,
        is_active: restored.is_active,
      });
    } catch (err) {
      console.error("Restore Faculty Error:", err);
      Response.error(res, FACULTY.messages.fetch_failed, 500);
    }
  }

  // Get active faculties only (for dropdowns)
  async getActiveFaculties(req, res) {
    try {
      const faculties = await MongoService.find(
        Faculty,
        { is_active: true },
        "_id name code",
        {
          sort: { name: 1 },
        }
      );

      Response.success(res, "Active faculties retrieved", {
        faculties: faculties.map((faculty) => ({
          id: faculty._id,
          name: faculty.name,
          code: faculty.code,
        })),
      });
    } catch (err) {
      console.error("Get Active Faculties Error:", err);
      Response.error(res, "Failed to retrieve active faculties", 500);
    }
  }
}
