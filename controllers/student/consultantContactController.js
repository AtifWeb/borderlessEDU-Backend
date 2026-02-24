import { ConsultantContact } from "../../schemas/consultant/contact.js";
import { ConsultantContactJoi } from "../../validation/consultant/contact.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import { Profile as ConsultantProfile } from "../../schemas/consultant/profile.js";

export class ConsultantContactController {
  // Student creates a contact to a consultant
  async contactConsultant(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      const payload = {
        consultant: req.body.consultant,
        application: req.body.application,
        message: req.body.message,
      };

      const { error, value } =
        ConsultantContactJoi.createSchema().validate(payload);
      if (error) return Response.error(res, error.details[0].message, 400);

      const createPayload = {
        student: req.user.id,
        consultant: value.consultant,
        application: value.application || undefined,
        message: value.message,
      };

      const created = await MongoService.create(
        ConsultantContact,
        createPayload
      );
      Response.success(res, "Contact created", { id: created._id });
    } catch (err) {
      console.error("Contact Consultant Error:", err);
      Response.error(res, "Failed to contact consultant", 500);
    }
  }

  // List contacts created by authenticated student
  async listMyContacts(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      const {
        page = 1,
        limit = 20,
        consultant,
        application,
        status,
      } = req.query;
      const filter = { student: req.user.id };
      if (consultant) filter.consultant = consultant;
      if (application) filter.application = application;
      if (status) filter.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const items = await ConsultantContact.find(filter)
        .populate("consultant application")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .exec();

      const total = await MongoService.count(ConsultantContact, filter);

      const enriched = await Promise.all(
        items.map(async (it) => {
          const obj = it.toObject();
          if (obj.consultant && obj.consultant._id) {
            const prof = await MongoService.findOne(ConsultantProfile, {
              user: obj.consultant._id,
            });
            obj.consultant = {
              id: obj.consultant._id,
              name: obj.consultant.name,
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
      console.error("List My Contacts Error:", err);
      Response.error(res, "Failed to list contacts", 500);
    }
  }

  // Get a single contact by id (student owner)
  async getContact(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { id } = req.params;
      const c = await ConsultantContact.findById(id)
        .populate("consultant application")
        .exec();
      if (!c) return Response.error(res, "Contact not found", 404);
      if (String(c.student) !== String(req.user.id))
        return Response.error(res, "Forbidden", 403);

      const obj = c.toObject();
      if (obj.consultant && obj.consultant._id) {
        const prof = await MongoService.findOne(ConsultantProfile, {
          user: obj.consultant._id,
        });
        obj.consultant = {
          id: obj.consultant._id,
          name: obj.consultant.name,
          profile: {
            bio: prof?.bio || "",
            country: prof?.country || "",
            avatar: prof?.avatar || "",
          },
        };
      }
      Response.success(res, "Contact retrieved", { contact: obj });
    } catch (err) {
      console.error("Get My Contact Error:", err);
      Response.error(res, "Failed to fetch contact", 500);
    }
  }
}

export default ConsultantContactController;
