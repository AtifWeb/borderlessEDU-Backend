import mongoose from "mongoose";
import { Application } from "../../schemas/student/application.js";
import { ConsultantBooking } from "../../schemas/consultant/booking.js";
import { StudentSavedPrograms } from "../../schemas/student/savedPrograms.js";
import { MongoService } from "../../services/MongoService.js";
import { Response } from "../../utils/Response.js";

export class MetricsController {
  // GET /student/metrics
  async getMetrics(req, res) {
    try {
      const studentId = req.user?.id;
      if (!studentId) return Response.error(res, "Unauthorized", 401);

      // Total applications for this student
      const totalApplications = await MongoService.count(Application, {
        created_by: studentId,
      });

      // Rejected applications
      const rejected = await MongoService.count(Application, {
        created_by: studentId,
        status: "rejected",
      });

      // In-review / submitted applications (consider both submitted and review)
      const inReview = await MongoService.count(Application, {
        created_by: studentId,
        status: { $in: ["submitted", "review"] },
      });

      // Booked consultations (bookings created by this student)
      const bookedConsultations = await MongoService.count(ConsultantBooking, {
        student: studentId,
      });

      // Monthly applications (last 12 months) - prepare a 12-month series
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const studentObjId = (() => {
        try {
          return mongoose.Types.ObjectId(studentId);
        } catch (e) {
          return studentId;
        }
      })();

      const monthlyAgg = await Application.aggregate([
        {
          $match: {
            created_by: studentObjId,
            createdAt: { $gte: start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            count: 1,
          },
        },
      ]).exec();

      // Build last 12 months array with zeros where necessary
      const monthNames = [
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
      ];

      const monthlyApplications = [];
      for (let i = 11; i >= 0; i--) {
        const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1; // 1-12
        const found = monthlyAgg.find(
          (m) => m.year === year && m.month === month,
        );
        monthlyApplications.push({
          year,
          month,
          monthName: monthNames[month],
          count: found ? found.count : 0,
        });
      }

      // Last 3 applications (most recent)
      const recentAppsDocs = await Application.find({ created_by: studentId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
        .exec();

      const recentApplications = recentAppsDocs.map((a) => ({
        id: a._id,
        program: a.program_details?.program_applying || null,
        university: a.university_details?.university_name || null,
        status: a.status || null,
        createdAt: a.createdAt,
      }));

      // Saved programs: count and last 3 saved (populate program_ref)
      const savedDoc = await MongoService.findOneWithPopulate(
        StudentSavedPrograms,
        { student: studentId },
        "programs.program_ref",
      );

      let savedCount = 0;
      let savedPrograms = [];
      if (savedDoc) {
        savedCount = Array.isArray(savedDoc.programs)
          ? savedDoc.programs.length
          : 0;
        const lastPrograms = (savedDoc.programs || []).slice(-3).reverse();
        savedPrograms = lastPrograms.map((s) => ({
          id: s._id,
          program_ref: s.program_ref || null,
          program_id: s.program_id || null,
          saved_at: s.saved_at || s.createdAt || null,
        }));
      }

      return Response.success(res, "Student metrics retrieved", {
        totalApplications,
        rejected,
        inReview,
        bookedConsultations,
        monthlyApplications,
        recentApplications,
        savedCount,
        savedPrograms,
      });
    } catch (err) {
      console.error("Get Student Metrics Error:", err);
      return Response.error(res, "Failed to fetch metrics", 500);
    }
  }
}

export default MetricsController;
