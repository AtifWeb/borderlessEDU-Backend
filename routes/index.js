import { Router } from "express";
import healthRoutes from "./health.routes.js";

// student routes
import studentAuthRoutes from "./student/auth.routes.js";
import studentProfileRoutes from "./student/profile.routes.js";
import studentMetricsRoutes from "./student/metrics.routes.js";
import studentApplicationRoutes from "./student/application.routes.js";
import studentDocumentsRoutes from "./student/documents.routes.js";
import studentSavedRoutes from "./student/saved.routes.js";
import studentMessageRoutes from "./student/message.routes.js";
import consultantContact from "./student/consultantContact.routes.js";

// consultant roourtes
import consultantAuthRoutes from "./consultant/auth.routes.js";
import consultantProfileRoutes from "./consultant/profile.routes.js";
import consultantContactRoutes from "./consultant/contact.routes.js";
import consultantMessageRoutes from "./consultant/message.routes.js";
import consultantPaymentRoutes from "./consultant/payment.routes.js";
import consultantBookingRoutes from "./consultant/booking.routes.js";
import universityRoutes from "./university/university.routes.js";

// admin routes
import adminAuthRoutes from "./admin/auth.routes.js";
import adminProfileRoutes from "./admin/profile.routes.js";
import adminProgramRoutes from "./admin/program.routes.js";
import adminFacultyRoutes from "./admin/faculty.routes.js";
import adminDepartmentRoutes from "./admin/department.routes.js";
import adminApplicationRoutes from "./admin/application.routes.js";
import adminStudentRoutes from "./admin/student.routes.js";
import adminConsultantRoutes from "./admin/consultant.routes.js";
import adminMessageRoutes from "./admin/message.routes.js";

// otp routes
import otpRoutes from "./global/otp.routes.js";
import emailRoutes from "./global/email.routes.js";

const router = Router();

router.use("/health", healthRoutes);

// student routes
router.use("/student/auth", studentAuthRoutes);
router.use("/student/profile", studentProfileRoutes);
router.use("/student/metrics", studentMetricsRoutes);
router.use("/student/application", studentApplicationRoutes);
router.use("/student/documents", studentDocumentsRoutes);
router.use("/student/saved", studentSavedRoutes);
router.use("/student/messages", studentMessageRoutes);
router.use("/student/contact", consultantContact);
// consultant routes
router.use("/consultant/auth", consultantAuthRoutes);
router.use("/consultant/profile", consultantProfileRoutes);
router.use("/consultant/contact", consultantContactRoutes);
router.use("/consultant/messages", consultantMessageRoutes);
router.use("/consultant/payment", consultantPaymentRoutes);
router.use("/consultant/bookings", consultantBookingRoutes);

// university routes
router.use("/university", universityRoutes);

// admin routes
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/profile", adminProfileRoutes);
router.use("/admin/program", adminProgramRoutes);
router.use("/admin/faculty", adminFacultyRoutes);
router.use("/admin/department", adminDepartmentRoutes);
router.use("/admin/application", adminApplicationRoutes);
router.use("/admin/student", adminStudentRoutes);
router.use("/admin/consultant", adminConsultantRoutes);
router.use("/admin/messages", adminMessageRoutes);

// OTP routes
router.use("/email", emailRoutes);
router.use("/otp", otpRoutes);
export default router;
