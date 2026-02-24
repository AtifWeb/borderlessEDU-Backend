import { ConsultantBooking } from "../../schemas/consultant/booking.js";
import { Application } from "../../schemas/student/application.js";
import mongoose from "mongoose";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import { Profile as StudentProfile } from "../../schemas/student/profile.js";
import { Profile as ConsultantProfile } from "../../schemas/consultant/profile.js";

const isConsultantUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "consultant" || role === "Consultant";
};

export class ConsultantBookingController {
  // student creates a booking for a consultant
  async createBooking(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      // Check if booking already exists between this student and consultant
      const existingBooking = await MongoService.findOne(ConsultantBooking, {
        student: req.user.id,
        consultant: req.body.consultant,
      });

      if (existingBooking) {
        return Response.error(
          res,
          "You have already booked this consultant",
          409,
        );
      }

      // application is required for bookings
      if (!req.body.application) {
        return Response.error(res, "Application id is required", 400);
      }

      // verify application exists
      const applicationExists = await Application.findById(
        req.body.application,
      ).exec();
      if (!applicationExists) {
        return Response.error(res, "Application not found", 404);
      }

      const payload = {
        student: req.user.id,
        consultant: req.body.consultant,
        application: req.body.application,
        scheduledAt: req.body.scheduledAt || null,
        notes: req.body.notes || null,
        meta: req.body.meta || {},
      };
      const created = await MongoService.create(ConsultantBooking, payload);
      Response.success(res, "Booking created", { id: created._id });
    } catch (err) {
      console.error("Create Booking Error:", err);
      Response.error(res, "Failed to create booking", 500);
    }
  }

  // list bookings - consultant can see their bookings, student can see theirs
  async listBookings(req, res) {
    try {
      const { consultant, student, page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const filter = {};
      if (consultant) filter.consultant = consultant;
      if (student) filter.student = student;

      // if consultant user, limit to their id
      if (isConsultantUser(req.user)) filter.consultant = req.user.id;

      const docs = await ConsultantBooking.find(filter)
        .populate("student", "name email")
        .populate("consultant", "name email")
        .populate({
          path: "application",
          populate: { path: "related_program" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      console.log(docs);

      const total = await MongoService.count(ConsultantBooking, filter);

      // Get unique user IDs for profiles
      const userIds = [
        ...new Set([
          ...docs.map((d) => d.student?._id).filter((id) => id),
          ...docs.map((d) => d.consultant?._id).filter((id) => id),
        ]),
      ];

      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const bookings = docs.map((doc) => ({
        id: doc._id,
        student: doc.student
          ? {
              id: doc.student._id,
              name: doc.student.name,
              email: doc.student.email,
              avatar:
                profileMap.get(doc.student._id.toString())?.avatar || null,
              bio: profileMap.get(doc.student._id.toString())?.bio || null,
              phone: profileMap.get(doc.student._id.toString())?.phone || null,
              address:
                profileMap.get(doc.student._id.toString())?.address || null,
              country:
                profileMap.get(doc.student._id.toString())?.country || null,
            }
          : null,
        consultant: doc.consultant
          ? {
              id: doc.consultant._id,
              name: doc.consultant.name,
              email: doc.consultant.email,
              avatar:
                profileMap.get(doc.consultant._id.toString())?.avatar || null,
              bio: profileMap.get(doc.consultant._id.toString())?.bio || null,
              phone:
                profileMap.get(doc.consultant._id.toString())?.phone || null,
              address:
                profileMap.get(doc.consultant._id.toString())?.address || null,
              country:
                profileMap.get(doc.consultant._id.toString())?.country || null,
            }
          : null,
        application: doc.application || null,
        status: doc.status,
        notes: doc.notes,
        scheduledAt: doc.scheduledAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      Response.success(res, "Bookings retrieved", {
        bookings,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("List Bookings Error:", err);
      Response.error(res, "Failed to list bookings", 500);
    }
  }

  async getBooking(req, res) {
    try {
      const id = req.params.id;
      const doc = await ConsultantBooking.findById(id)
        .populate("student", "name email")
        .populate("consultant", "name email")
        .populate({
          path: "application",
          populate: { path: "related_program" },
        })
        .exec();

      if (!doc) return Response.error(res, "Booking not found", 404);

      // gather user ids for profile lookup
      const userIds = [doc.student?._id, doc.consultant?._id].filter((u) => u);
      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const booking = {
        id: doc._id,
        student: doc.student
          ? {
              id: doc.student._id,
              name: doc.student.name,
              email: doc.student.email,
              avatar:
                profileMap.get(doc.student._id.toString())?.avatar || null,
              bio: profileMap.get(doc.student._id.toString())?.bio || null,
              phone: profileMap.get(doc.student._id.toString())?.phone || null,
              address:
                profileMap.get(doc.student._id.toString())?.address || null,
              country:
                profileMap.get(doc.student._id.toString())?.country || null,
            }
          : null,
        consultant: doc.consultant
          ? {
              id: doc.consultant._id,
              name: doc.consultant.name,
              email: doc.consultant.email,
              avatar:
                profileMap.get(doc.consultant._id.toString())?.avatar || null,
              bio: profileMap.get(doc.consultant._id.toString())?.bio || null,
              phone:
                profileMap.get(doc.consultant._id.toString())?.phone || null,
              address:
                profileMap.get(doc.consultant._id.toString())?.address || null,
              country:
                profileMap.get(doc.consultant._id.toString())?.country || null,
            }
          : null,
        application: doc.application || null,
        status: doc.status,
        notes: doc.notes,
        scheduledAt: doc.scheduledAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

      Response.success(res, "Booking retrieved", { booking });
    } catch (err) {
      console.error("Get Booking Error:", err);
      Response.error(res, "Failed to get booking", 500);
    }
  }

  async updateBooking(req, res) {
    try {
      const id = req.params.id;
      const updated = await MongoService.updateById(
        ConsultantBooking,
        id,
        req.body,
        { new: true },
      );
      Response.success(res, "Booking updated", { booking: updated });
    } catch (err) {
      console.error("Update Booking Error:", err);
      Response.error(res, "Failed to update booking", 500);
    }
  }

  async deleteBooking(req, res) {
    try {
      const id = req.params.id;
      const deleted = await MongoService.deleteById(ConsultantBooking, id);
      Response.success(res, "Booking deleted", { id: deleted?._id });
    } catch (err) {
      console.error("Delete Booking Error:", err);
      Response.error(res, "Failed to delete booking", 500);
    }
  }

  // Get bookings aggregated by month for analytics
  async getBookingsByMonth(req, res) {
    try {
      const { year, consultant } = req.query;
      const matchFilter = {};
      console.log("req.user:", req.user);

      // Determine which consultant to filter by
      let consultantId;
      if (isConsultantUser(req.user)) {
        // If consultant user, limit to their bookings
        consultantId = req.user.id;
        console.log("Using authenticated consultant ID:", consultantId);
      } else if (consultant) {
        // If admin specifies a consultant, use that
        consultantId = consultant;
        console.log("Using provided consultant ID:", consultantId);
      } else {
        // No consultant specified - return error
        return Response.error(
          res,
          "Consultant ID required for this operation",
          400,
        );
      }

      // Validate consultant ID format before using
      if (!consultantId || typeof consultantId !== "string") {
        return Response.error(res, "Invalid consultant ID format", 400);
      }

      // Convert to ObjectId
      let consultantObjectId;
      try {
        consultantObjectId = new mongoose.Types.ObjectId(consultantId);
        matchFilter.consultant = consultantObjectId;
        console.log("Converted to ObjectId:", consultantObjectId);
      } catch (e) {
        console.error("ObjectId conversion error:", e.message);
        return Response.error(res, "Invalid consultant ID format", 400);
      }

      // If year is specified, filter by year
      if (year) {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${parseInt(year) + 1}-01-01`);
        matchFilter.createdAt = { $gte: startDate, $lt: endDate };
      }

      // debug: log the match filter
      console.log("getBookingsByMonth matchFilter:", matchFilter);

      const matchingCount = await ConsultantBooking.countDocuments(matchFilter);
      console.log("getBookingsByMonth matchingCount:", matchingCount);

      const bookingsByMonth = await ConsultantBooking.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            bookings: { $push: "$$ROOT" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            count: 1,
            monthName: {
              $arrayElemAt: [
                [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
                "$_id.month",
              ],
            },
          },
        },
      ]);

      Response.success(res, "Bookings by month retrieved", {
        bookingsByMonth,
        totalBookings: bookingsByMonth.reduce(
          (sum, month) => sum + month.count,
          0,
        ),
      });
    } catch (err) {
      console.error("Get Bookings By Month Error:", err);
      Response.error(res, "Failed to get bookings by month", 500);
    }
  }
}

export default ConsultantBookingController;
