import { University } from "../../schemas/global/university.js";
import { Consultant } from "../../schemas/consultant/consultant.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

const isConsultantUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "consultant" || role === "Consultant";
};

const isAdminUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "admin" || role === "Admin";
};

export class UniversityController {
  async create(req, res) {
    try {
      // Only consultants can create universities
      if (!isConsultantUser(req.user)) {
        return Response.error(
          res,
          "Only consultants can create universities",
          403
        );
      }

      const payload = {
        name: req.body.name,
        country: req.body.country,
        countryCode: req.body.countryCode,
        website: req.body.website,
        address: req.body.address,
        contact: req.body.contact,
        consultant: req.user.id,
        meta: req.body.meta || {},
      };
      const created = await MongoService.create(University, payload);
      Response.success(res, "University created", { id: created._id });
    } catch (err) {
      console.error("Create University Error:", err);
      Response.error(res, "Failed to create university", 500);
    }
  }

  async list(req, res) {
    try {
      const { page = 1, limit = 50, q } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const filter = {};

      // If consultant, only show their universities
      // If admin, show all universities
      if (isConsultantUser(req.user)) {
        filter.consultant = req.user.id;
      }
      // Admins can see all universities (no additional filter needed)

      if (q) filter.name = { $regex: q, $options: "i" };

      const docs = await University.find(filter)
        .populate("consultant", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      const total = await MongoService.count(University, filter);
      Response.success(res, "Universities retrieved", {
        universities: docs,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Universities Error:", err);
      Response.error(res, "Failed to list universities", 500);
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;
      const doc = await University.findById(id).populate(
        "consultant",
        "name email"
      );

      if (!doc) return Response.error(res, "University not found", 404);

      // If consultant, check if they own this university
      if (
        isConsultantUser(req.user) &&
        doc.consultant._id.toString() !== req.user.id
      ) {
        return Response.error(res, "Access denied", 403);
      }

      Response.success(res, "University retrieved", { university: doc });
    } catch (err) {
      console.error("Get University Error:", err);
      Response.error(res, "Failed to get university", 500);
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;

      // First check if university exists and get ownership
      const existingUniversity = await University.findById(id);
      if (!existingUniversity) {
        return Response.error(res, "University not found", 404);
      }

      // If consultant, check if they own this university
      if (
        isConsultantUser(req.user) &&
        existingUniversity.consultant.toString() !== req.user.id
      ) {
        return Response.error(res, "Access denied", 403);
      }

      const updated = await MongoService.updateById(University, id, req.body, {
        new: true,
      });
      Response.success(res, "University updated", { university: updated });
    } catch (err) {
      console.error("Update University Error:", err);
      Response.error(res, "Failed to update university", 500);
    }
  }

  async remove(req, res) {
    try {
      const id = req.params.id;

      // First check if university exists and get ownership
      const existingUniversity = await University.findById(id);
      if (!existingUniversity) {
        return Response.error(res, "University not found", 404);
      }

      // If consultant, check if they own this university
      if (
        isConsultantUser(req.user) &&
        existingUniversity.consultant.toString() !== req.user.id
      ) {
        return Response.error(res, "Access denied", 403);
      }

      const deleted = await MongoService.deleteById(University, id);
      Response.success(res, "University deleted", { id: deleted?._id });
    } catch (err) {
      console.error("Delete University Error:", err);
      Response.error(res, "Failed to delete university", 500);
    }
  }
}

export default UniversityController;
