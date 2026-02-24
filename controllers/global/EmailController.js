import { Response } from "../../utils/Response.js";
import { EmailService } from "../../services/EmailService.js";

export class EmailController {
  async contactSupport(req, res) {
    try {
      const { email, message } = req.body || {};
      if (!email || !message)
        return Response.error(res, "email and message are required", 400);

      try {
        await EmailService.sendContactSupportEmail({
          from: email,
          message,
        });
      } catch (err) {
        console.error("Failed to send contact-support email:", err);
      }

      return Response.success(res, "Message sent to support", {});
    } catch (err) {
      console.error(err);
      return Response.error(res, "Server error", 500);
    }
  }

  async sendDeleteApplication(req, res) {
    try {
      const {
        applicationId,
        reason,
        consultantName,
        applicationDate,
        programName,
        universityName,
        studentEmail,
        studentName,
        applicationStatus = "DELETED",
        consultantEmail,
      } = req.body || {};

      if (!consultantEmail || !applicationId) {
        return Response.error(
          res,
          "consultantEmail and applicationId are required",
          400,
        );
      }

      try {
        await EmailService.sendDeleteApplicationEmail({
          to: consultantEmail,
          applicationId,
          reason,
          consultantName: consultantName || "Consultant",
          applicationDate: applicationDate || new Date().toLocaleDateString(),
          programName: programName || "Unknown Program",
          universityName: universityName || "Unknown University",
          studentEmail: studentEmail || "Not specified",
          studentName: studentName || "Not specified",
          applicationStatus,
          consultantEmail: consultantEmail,
          deletedByName: studentEmail || "System",
          deletedByEmail: studentName || "system@borderless.edu",
        });
      } catch (err) {
        console.error("Failed to send delete-application email:", err);
        return Response.error(res, "Failed to send email", 500);
      }

      return Response.success(res, "Delete application email sent", {});
    } catch (err) {
      console.error(err);
      return Response.error(res, "Server error", 500);
    }
  }
  async sendBookingConfirmation(req, res) {
    try {
      const {
        studentEmail,
        consultantEmail,
        studentName,
        consultantName,
        applicationName,
        universityName,
        bookingDate,
        bookingId,
        sendToBoth = true,
      } = req.body || {};

      // Validate required fields
      if (
        !studentEmail ||
        !consultantEmail ||
        !studentName ||
        !consultantName ||
        !applicationName
      ) {
        return Response.error(res, "Missing required fields", 400);
      }

      try {
        // Send to student
        await EmailService.sendBookingConfirmationEmail({
          to: studentEmail,
          studentName,
          studentEmail,
          consultantName,
          consultantEmail,
          applicationName,
          universityName: universityName || "University not specified",
          bookingDate: bookingDate || new Date().toLocaleDateString(),
          greetingMessage: `Booking with ${consultantName} has been confirmed!`,
          dashboardLink: process.env.FRONTEND_URL || "#",
        });

        // Optionally send to consultant too (different message)
        if (sendToBoth) {
          await EmailService.sendBookingConfirmationEmail({
            to: consultantEmail,
            studentName,
            studentEmail,
            consultantName,
            consultantEmail,
            applicationName,
            universityName: universityName || "University not specified",
            bookingDate: bookingDate || new Date().toLocaleDateString(),
            bookingId: bookingId || `BKG-${Date.now()}`,
            greetingMessage: `New booking received from ${studentName}!`,
            dashboardLink: process.env.DASHBOARD_URL || "#",
            supportEmail: process.env.SUPPORT_EMAIL || "support@borderless.edu",
          });
        }
      } catch (err) {
        console.error("Failed to send booking confirmation email:", err);
        return Response.error(res, "Failed to send email", 500);
      }

      return Response.success(res, "Booking confirmation email(s) sent", {});
    } catch (err) {
      console.error(err);
      return Response.error(res, "Server error", 500);
    }
  }
  async sendMessageNotification(req, res) {
    try {
      const {
        to,
        senderName,
        senderEmail,
        messageContent,
        messageDate,
        messageTime,
        url,
      } = req.body || {};

      if (!to || !senderName || !senderEmail || !messageContent) {
        return Response.error(res, "Missing required fields", 400);
      }

      try {
        await EmailService.sendMessageReceivedEmail({
          to,
          senderName,
          senderEmail,
          messageContent,
          messageDate: messageDate || new Date().toLocaleDateString(),
          messageTime:
            messageTime ||
            new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          url: url,
        });
      } catch (err) {
        console.error("Failed to send message notification email:", err);
        return Response.error(res, "Failed to send email", 500);
      }

      return Response.success(res, "Message notification email sent", {});
    } catch (err) {
      console.error(err);
      return Response.error(res, "Server error", 500);
    }
  }
}

export default EmailController;
