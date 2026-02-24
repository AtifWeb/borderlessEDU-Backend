import { Department } from "../../schemas/admin/department.js";
import { DeletedDepartment } from "../../schemas/admin/deletedDepartment.js";
import { DepartmentJoi } from "../../validation/department/department.js";
import { Response } from "../../utils/Response.js";
import { PROGRAM } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";

export class DepartmentController {
  // Create department
  async createDepartment(req, res) {
    try {
      if (!req.user?.id) {
        return Response.error(res, "Unauthorized", 401);
      }

      req.body.created_by = req.user.id;

      const { error, value } = DepartmentJoi.createSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      // ensure unique code
      const existing = await MongoService.findOne(Department, {
        code: value.code,
      });
      if (existing)
        return Response.error(res, "Department code already exists", 400);

      const created = await MongoService.create(Department, value);
      Response.success(res, "Department created successfully", {
        id: created._id,
        name: created.name,
        code: created.code,
        faculty_id: created.faculty_id,
      });
    } catch (err) {
      console.error("Create Department Error:", err);
      Response.error(res, "Failed to create department", 500);
    }
  }

  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const { error, value } = DepartmentJoi.querySchema().validate(req.query);
      if (error) return Response.error(res, error.details[0].message, 400);

      const {
        page,
        limit,
        search,
        faculty_id,
        is_active,
        sort_by,
        sort_order,
      } = value;
      const filter = {};
      if (faculty_id) filter.faculty_id = faculty_id;
      if (is_active !== undefined) filter.is_active = is_active;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sort_by] = sort_order === "asc" ? 1 : -1;

      const departments = await MongoService.find(Department, filter, null, {
        skip,
        limit,
        sort,
      });
      const total = await MongoService.count(Department, filter);

      Response.success(res, "Departments retrieved", {
        departments: departments.map((d) => ({
          id: d._id,
          name: d.name,
          code: d.code,
          faculty_id: d.faculty_id,
          is_active: d.is_active,
        })),
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Get Departments Error:", err);
      Response.error(res, "Failed to fetch departments", 500);
    }
  }

  // Get department by ID
  async getDepartment(req, res) {
    try {
      const { id } = req.params;
      const department = await MongoService.findById(Department, id);
      if (!department) return Response.error(res, "Department not found", 404);
      Response.success(res, "Department retrieved", { department });
    } catch (err) {
      console.error("Get Department Error:", err);
      Response.error(res, "Failed to fetch department", 500);
    }
  }

  // Update department
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = DepartmentJoi.updateSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      const existing = await MongoService.findById(Department, id);
      if (!existing) return Response.error(res, "Department not found", 404);

      if (value.code && value.code !== existing.code) {
        const dup = await MongoService.findOne(Department, {
          code: value.code,
          _id: { $ne: id },
        });
        if (dup)
          return Response.error(res, "Department code already exists", 400);
      }

      const updated = await MongoService.updateById(Department, id, value);
      Response.success(res, "Department updated", {
        id: updated._id,
        name: updated.name,
        code: updated.code,
      });
    } catch (err) {
      console.error("Update Department Error:", err);
      Response.error(res, "Failed to update department", 500);
    }
  }

  // Delete department -> move to DeletedDepartment then remove
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;
      const dept = await MongoService.findById(Department, id);
      if (!dept) return Response.error(res, "Department not found", 404);

      const doc = dept.toObject();
      const deletedDoc = {
        original_department_id: doc._id,
        name: doc.name,
        code: doc.code,
        description: doc.description,
        faculty_id: doc.faculty_id,
        is_active: doc.is_active,
        created_by: doc.created_by,
        deleted_by: req.user?.id || null,
        deleted_at: new Date(),
      };

      const createdDeleted = await MongoService.create(
        DeletedDepartment,
        deletedDoc
      );
      await MongoService.deleteById(Department, id);

      Response.success(res, "Department deleted", {
        id: createdDeleted._id,
        code: createdDeleted.code,
      });
    } catch (err) {
      console.error("Delete Department Error:", err);
      Response.error(res, "Failed to delete department", 500);
    }
  }

  // Restore department
  async restoreDepartment(req, res) {
    try {
      const { id } = req.params; // id of DeletedDepartment
      const deletedDoc = await MongoService.findById(DeletedDepartment, id);
      if (!deletedDoc)
        return Response.error(res, "Deleted department not found", 404);

      const doc = deletedDoc.toObject();
      if (doc.code) {
        const existing = await MongoService.findOne(Department, {
          code: doc.code,
        });
        if (existing)
          return Response.error(res, "Department code already exists", 400);
      }

      const deptData = {
        name: doc.name,
        code: doc.code,
        description: doc.description,
        faculty_id: doc.faculty_id,
        is_active: doc.is_active,
        created_by: doc.created_by || req.user?.id,
      };
      if (doc.original_department_id) deptData._id = doc.original_department_id;

      const restored = await MongoService.create(Department, deptData);
      await MongoService.deleteById(DeletedDepartment, id);

      Response.success(res, "Department restored", {
        id: restored._id,
        code: restored.code,
      });
    } catch (err) {
      console.error("Restore Department Error:", err);
      Response.error(res, "Failed to restore department", 500);
    }
  }
}

export default DepartmentController;
