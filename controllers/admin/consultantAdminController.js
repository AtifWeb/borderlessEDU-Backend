import { Consultant } from "../../schemas/consultant/consultant.js";
import { Profile } from "../../schemas/consultant/profile.js";
import { ConsultantPayment } from "../../schemas/consultant/payment.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

const isAdminUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "admin" || role === "Admin";
};

export class ConsultantAdminController {
  // List consultants (with optional search, pagination)
  async listConsultants(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const users = await MongoService.find(Consultant, filter, null, {
        skip,
        limit: parseInt(limit),
        sort: { _id: -1 },
      });
      const total = await MongoService.count(Consultant, filter);

      // Attach a compact profile summary and payment info for each consultant
      const items = await Promise.all(
        users.map(async (u) => {
          const profile = await MongoService.findOne(Profile, { user: u._id });
          const payment = await MongoService.findOne(ConsultantPayment, {
            consultant: u._id,
          });
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
                  company: profile.company || "",
                  created_at: profile.createdAt || "",
                }
              : null,
            payment: payment
              ? {
                  paid: payment.paid || false,
                  plan: payment.plan || "standard",
                  in_trial:
                    payment.trial_ends_at && payment.trial_ends_at > new Date(),
                  trial_ends_at: payment.trial_ends_at || null,
                  next_payment_date: payment.next_payment_date || null,
                  last_payment_at: payment.last_payment_at || null,
                  auto_renew: payment.auto_renew || false,
                }
              : {
                  paid: false,
                  plan: "standard",
                  in_trial: false,
                  trial_ends_at: null,
                  next_payment_date: null,
                  last_payment_at: null,
                  auto_renew: false,
                },
          };
        }),
      );

      Response.success(res, "Consultants retrieved", {
        consultants: items,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Consultants Error:", err);
      Response.error(res, "Failed to list consultants", 500);
    }
  }
  async updateConsultant(req, res) {
    try {
      if (!isAdminUser(req.user))
        return Response.error(res, "Unauthorized", 401);

      const { id } = req.params;
      const { name, email } = req.body;

      const consultant = await MongoService.findById(Consultant, id);
      if (!consultant) return Response.error(res, "Consultant not found", 404);

      // Update allowed fields
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      if (Object.keys(updateData).length === 0) {
        return Response.error(res, "No fields to update", 400);
      }

      const updated = await MongoService.updateById(
        Consultant,
        id,
        updateData,
        { new: true },
      );

      Response.success(res, "Consultant updated successfully", {
        consultant: {
          id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        },
      });
    } catch (err) {
      console.error("Update Consultant Error:", err);
      Response.error(res, "Failed to update consultant", 500);
    }
  }
  // Delete consultant
  async deleteConsultant(req, res) {
    try {
      if (!isAdminUser(req.user))
        return Response.error(res, "Unauthorized", 401);

      const { id } = req.params;

      const consultant = await MongoService.findById(Consultant, id);
      if (!consultant) return Response.error(res, "Consultant not found", 404);

      // Delete consultant profile if exists
      await MongoService.deleteOne(Profile, { user: id });

      // Delete consultant payment if exists
      await MongoService.deleteOne(ConsultantPayment, { consultant: id });

      // Delete consultant account
      await MongoService.deleteById(Consultant, id);

      Response.success(res, "Consultant deleted successfully");
    } catch (err) {
      console.error("Delete Consultant Error:", err);
      Response.error(res, "Failed to delete consultant", 500);
    }
  }

  // Get complete consultant profile by consultant id
  async getConsultant(req, res) {
    try {
      const { id } = req.params;

      const consultant = await MongoService.findById(Consultant, id);
      if (!consultant) return Response.error(res, "Consultant not found", 404);

      const profile = await MongoService.findOne(Profile, {
        user: consultant._id,
      });

      const profileData = profile
        ? {
            bio: profile.bio || "",
            phone: profile.phone || "",
            address: profile.address || "",
            country: profile.country || "",
            avatar: profile.avatar || "",
            company: profile.company || "",
            created_at: profile.createdAt || "",
          }
        : null;

      Response.success(res, "Consultant retrieved", {
        consultant: {
          id: consultant._id,
          name: consultant.name,
          email: consultant.email,
          role: consultant.role,
          profile: profileData,
        },
      });
    } catch (err) {
      console.error("Get Consultant Error:", err);
      Response.error(res, "Failed to fetch consultant", 500);
    }
  }
}

export default ConsultantAdminController;
