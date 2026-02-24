import { ConsultantContact } from "../../schemas/consultant/contact.js";
import { ConsultantContactJoi } from "../../validation/consultant/contact.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import { Profile as StudentProfile } from "../../schemas/student/profile.js";

const isConsultantUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "consultant" || role === "Consultant";
};

export class ConsultantContactController {
  // List contacts for authenticated consultant with optional filters
  async listContacts(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);

      const { page = 1, limit = 20, status, student } = req.query;
      const filter = { consultant: req.user.id };
      if (status) filter.status = status;
      if (student) filter.student = student;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const items = await ConsultantContact.find(filter)
        .populate("student", "-password")
        .populate("application")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .exec();

      const total = await MongoService.count(ConsultantContact, filter);

      const enriched = await Promise.all(
        items.map(async (it) => {
          const obj = it.toObject();
          if (obj.student && obj.student._id) {
            const prof = await MongoService.findOne(StudentProfile, {
              user: obj.student._id,
            });
            obj.student = {
              id: obj.student._id,
              name: obj.student.name,
              email: obj.student.email,
              role: obj.student.role,
              profile: {
                bio: prof?.bio || "",
                country: prof?.country || "",
                avatar: prof?.avatar || "",
              },
            };
          }
          return obj;
        })
      );

      Response.success(res, "Contacts retrieved", {
        contacts: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Contacts Error:", err);
      Response.error(res, "Failed to list contacts", 500);
    }
  }

  // Get contact detail
  async getContact(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);
      const { id } = req.params;
      const c = await ConsultantContact.findById(id)
        .populate("student", "-password")
        .populate("application")
        .exec();
      if (!c) return Response.error(res, "Contact not found", 404);
      if (String(c.consultant) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);

      const obj = c.toObject();
      if (obj.student && obj.student._id) {
        const prof = await MongoService.findOne(StudentProfile, {
          user: obj.student._id,
        });
        obj.student = {
          id: obj.student._id,
          name: obj.student.name,
          email: obj.student.email,
          role: obj.student.role,
          profile: {
            bio: prof?.bio || "",
            country: prof?.country || "",
            avatar: prof?.avatar || "",
          },
        };
      }

      Response.success(res, "Contact retrieved", { contact: obj });
    } catch (err) {
      console.error("Get Contact Error:", err);
      Response.error(res, "Failed to fetch contact", 500);
    }
  }

  // Respond to a contact (add response and update status)
  async respond(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);
      const { id } = req.params;
      const { error, value } = ConsultantContactJoi.respondSchema().validate(
        req.body
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      const c = await MongoService.findById(ConsultantContact, id);
      if (!c) return Response.error(res, "Contact not found", 404);
      if (String(c.consultant) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);

      const updated = await MongoService.updateById(ConsultantContact, id, {
        response: value.response,
        status: value.status || "responded",
        last_updated_by: req.user.id,
      });
      Response.success(res, "Responded", { contact: updated });
    } catch (err) {
      console.error("Respond Error:", err);
      Response.error(res, "Failed to respond", 500);
    }
  }
}

export default ConsultantContactController;
