import { Student } from "../../schemas/student/student.js";
import { Profile } from "../../schemas/student/profile.js";
import { Application } from "../../schemas/student/application.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

const isAdminUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "admin" || role === "Admin";
};

export class StudentAdminController {
  // List students (with optional search, pagination)
  async listStudents(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);

      const { page = 1, limit = 20, search } = req.query;
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const users = await MongoService.find(Student, filter, null, {
        skip,
        limit: parseInt(limit),
        sort: { _id: -1 },
      });
      const total = await MongoService.count(Student, filter);

      // Attach a compact profile summary for each student
      const items = await Promise.all(
        users.map(async (u) => {
          const profile = await MongoService.findOne(Profile, { user: u._id });
          return {
            id: u._id,
            name: u.name,
            email: u.email,
            profile: profile
              ? {
                  bio: profile.bio || "",
                  phone: profile.phone || "",
                  address: profile.address || "",
                  country: profile.country || "",
                  avatar: profile.avatar || "",
                  created_at: profile.createdAt || "",
                }
              : null,
          };
        })
      );

      Response.success(res, "Students retrieved", {
        students: items,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Students Error:", err);
      Response.error(res, "Failed to list students", 500);
    }
  }

  // Get complete student profile by student id
  async getStudent(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);
      const { id } = req.params;

      const student = await MongoService.findById(Student, id);
      if (!student) return Response.error(res, "Student not found", 404);

      const profile = await MongoService.findOne(Profile, {
        user: student._id,
      });
      const applications = await MongoService.find(Application, {
        created_by: student._id,
      });

      Response.success(res, "Student retrieved", {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
        profile: profile || null,
        applications: applications || [],
      });
    } catch (err) {
      console.error("Get Student Error:", err);
      Response.error(res, "Failed to fetch student", 500);
    }
  }
}

export default StudentAdminController;
