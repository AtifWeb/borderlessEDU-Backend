import { Application } from "../../schemas/student/application.js";
import { Consultant } from "../../schemas/consultant/consultant.js";
import { StudentApplicationJoi } from "../../validation/student/application.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import { ConsultantBooking } from "../../schemas/consultant/booking.js";

export class ApplicationController {
  // Student creates an application
  async createApplication(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      req.body.created_by = req.user.id;

      const { error, value } = StudentApplicationJoi.createSchema().validate(
        req.body,
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      // Ensure consultant is exactly one and exists
      if (!value.consultant) {
        return Response.error(res, "A single consultant must be selected", 400);
      }

      const consultantExists = await MongoService.findById(
        Consultant,
        value.consultant,
      );
      if (!consultantExists) {
        return Response.error(res, "Selected consultant not found", 404);
      }

      // Create the application
      const created = await MongoService.create(Application, value);

      // Create a booking for this student-consultant pair if not exists
      try {
        const existingBooking = await MongoService.findOne(ConsultantBooking, {
          student: req.user.id,
          consultant: value.consultant,
          application: created._id, // Also check for this specific application
        });

        let bookingId = null;
        if (!existingBooking) {
          const bookingPayload = {
            student: req.user.id,
            consultant: value.consultant,
            application: created._id,
            notes: `Booking created for application ${created._id}`,
            status: "pending",
          };

          const booking = await MongoService.create(
            ConsultantBooking,
            bookingPayload,
          );
          bookingId = booking._id;
          console.log("Booking created:", booking);
        } else {
          bookingId = existingBooking._id;
          console.log("Existing booking found:", existingBooking);
        }

        Response.success(res, "Application created successfully", {
          id: created._id,
          bookingId,
        });
      } catch (bookingErr) {
        console.error("Create booking error:", bookingErr);
        // Still return success for application creation
        Response.success(res, "Application created (booking failed)", {
          id: created._id,
          error: "Booking creation failed but application was saved",
        });
      }
    } catch (err) {
      console.error("Create Application Error:", err);
      Response.error(res, "Failed to create application", 500);
    }
  }

  // Get all applications for the authenticated student
  async getMyApplications(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const filter = { created_by: req.user.id };
      const apps = await Application.find(filter, null, {
        skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      })
        .populate({
          path: "consultant",
          model: "Consultant",
          select: "email name",
        })
        .populate({
          path: "program_details.program_ref",
          model: "Program",
          select: "university information fees",
        })
        .populate({
          path: "related_program",
          model: "Program",
          select: "information university fees",
        });

      console.log(apps);
      const total = await MongoService.count(Application, filter);
      Response.success(res, "Applications retrieved", {
        applications: apps,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("Get My Applications Error:", err);
      Response.error(res, "Failed to fetch applications", 500);
    }
  }

  // Get a single application by id (only owner)
  async getApplication(req, res) {
    try {
      const { id } = req.params;
      const app = await Application.findById(id)
        .populate({
          path: "program_details.program_ref",
          model: "Program",
          select: "university information fees",
        })
        .populate({
          path: "related_program",
          model: "Program",
          select: "information university fees",
        });
      if (!app) return Response.error(res, "Application not found", 404);
      if (String(app.created_by) !== String(req.user?.id))
        return Response.error(res, "Forbidden", 403);
      Response.success(res, "Application retrieved", { application: app });
    } catch (err) {
      console.error("Get Application Error:", err);
      Response.error(res, "Failed to fetch application", 500);
    }
  }

  // Delete an application (only owner)
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const app = await MongoService.findById(Application, id);
      if (!app) return Response.error(res, "Application not found", 404);
      if (String(app.created_by) !== String(req.user?.id))
        return Response.error(res, "Forbidden", 403);

      await MongoService.deleteById(Application, id);
      Response.success(res, "Application deleted successfully");
    } catch (err) {
      console.error("Delete Application Error:", err);
      Response.error(res, "Failed to delete application", 500);
    }
  }
}

export default ApplicationController;
