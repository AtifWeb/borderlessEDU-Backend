import { Application } from "../../schemas/student/application.js";
import { Profile } from "../../schemas/student/profile.js";
import { Profile as ConsultantProfile } from "../../schemas/consultant/profile.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

const isAdminUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "admin" || role === "Admin";
};

export class ApplicationAdminController {
  // List all applications with filters and pagination
  async listApplications(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);

      const {
        page = 1,
        limit = 20,
        status,
        program_id,
        student,
        search,
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (program_id) filter["program_details.program_id"] = program_id;
      if (student) filter.created_by = student;
      if (search) {
        filter.$or = [
          {
            "personal_information.student_name": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "personal_information.student_email": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "program_details.program_applying": {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const apps = await MongoService.findWithPopulate(
        Application,
        filter,
        ["created_by"],
        null,
        {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 },
        },
      );
      const total = await MongoService.count(Application, filter);

      // Fetch profiles for students
      const studentIds = apps
        .map((a) => a.created_by?._id || a.created_by)
        .filter((id) => id);
      const profiles = await Profile.find({ user: { $in: studentIds } });
      const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

      const formatted = apps.map((a) => {
        const profile = profileMap.get(a.created_by?._id?.toString());
        return {
          id: a._id,
          student: a.personal_information?.student_name,
          student_email: a.personal_information?.student_email,
          program: a.program_details?.program_applying,
          program_id: a.program_details?.program_id,
          status: a.status,
          bio: profile?.bio || "",
          avatar: profile?.avatar || "",
          country: profile?.country || "",
          created_at: a.createdAt,
        };
      });

      Response.success(res, "Applications retrieved", {
        applications: formatted,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Applications Error:", err);
      Response.error(res, "Failed to list applications", 500);
    }
  }

  // Get application details
  async getApplication(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);
      const { id } = req.params;
      const app = await MongoService.findWithPopulateSelect(
        Application,
        { _id: id },
        [
          "created_by",
          "related_program",
          { path: "consultant", select: "-password -__v" },
        ],
      );
      if (!app || app.length === 0)
        return Response.error(res, "Application not found", 404);

      const appData = app[0];

      console.log(appData);

      // Fetch consultant profile if exists
      let consultantInfo = null;
      if (appData.consultant) {
        const consultantProfile = await ConsultantProfile.findById(
          appData.consultant._id,
        );
        consultantInfo = {
          id: appData.consultant._id,
          name: appData.consultant.name || "Consultant",
          email: appData.consultant.email || "",
          avatar: consultantProfile?.avatar || null,
          bio: consultantProfile?.bio || null,
        };
      }

      Response.success(res, "Application retrieved", {
        application: appData,
        consultant: consultantInfo,
      });
    } catch (err) {
      console.error("Get Application Error:", err);
      Response.error(res, "Failed to fetch application", 500);
    }
  }

  // Update application status (accept/reject)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const app = await MongoService.findById(Application, id);
      if (!app) return Response.error(res, "Application not found", 404);

      const updated = await MongoService.updateById(Application, id, {
        status,
        last_updated_by: req.user.id,
      });
      Response.success(res, "Application status updated", {
        id: updated._id,
        status: updated.status,
      });
    } catch (err) {
      console.error("Update Application Status Error:", err);
      Response.error(res, "Failed to update status", 500);
    }
  }
}

export default ApplicationAdminController;
