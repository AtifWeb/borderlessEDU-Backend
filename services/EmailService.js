import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
export class EmailService {
  static async sendEmail({ to, subject, otpCode }) {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "verify-code.html",
    );
    let htmlTemplate = await fs.readFile(templatePath, "utf-8");

    htmlTemplate = htmlTemplate.replace("{{OTP}}", otpCode);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlTemplate,
    });

    return info;
  }

  static async sendResetPasswordEmail({ to, resetUrl, name }) {
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "forget-password.html",
    );

    let htmlTemplate = await fs.readFile(templatePath, "utf-8");
    htmlTemplate = htmlTemplate.replace("{{name}}", name || "User");
    htmlTemplate = htmlTemplate.replace("{{link}}", resetUrl);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your BorderlessEDU password",
      html: htmlTemplate,
    });

    return info;
  }

  static async sendContactSupportEmail({ from, message }) {
    const adminTo = process.env.ADMIN_EMAIL;
    const sender = from;
    const mailSubject = `Support request from ${from}`;

    const templatePath = path.join(process.cwd(), "templates", "support.html");

    let htmlTemplate = await fs.readFile(templatePath, "utf-8");
    htmlTemplate = htmlTemplate.replace(
      "{{message}}",
      message || "No message provided",
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${sender}>`,
      to: adminTo,
      subject: mailSubject,
      html: htmlTemplate,
    });

    return info;
  }

  static async sendDeleteApplicationEmail({
    to,
    applicationId,
    consultantName,
    applicationDate,
    programName,
    universityName,
    studentEmail,
    studentName,
    applicationStatus = "DELETED",
    consultantEmail,
    deletedByName,
    deletedByEmail,
  }) {
    const mailSubject = `Application for ${programName} Deleted - BorderlessEDU`;

    const templatePath = path.join(
      process.cwd(),
      "templates",
      "delete-application.html",
    );

    let htmlTemplate;

    try {
      const fileContent = await fs.readFile(templatePath, "utf-8");

      // Replace all template variables
      htmlTemplate = fileContent
        .replace(/{{application_id}}/gi, applicationId)
        .replace(/{{application_date}}/gi, applicationDate)
        .replace(/{{program_name}}/gi, programName)
        .replace(/{{university_name}}/gi, universityName)
        .replace(/{{student_email}}/gi, studentEmail)
        .replace(/{{student_name}}/gi, studentName)
        .replace(/{{application_status}}/gi, applicationStatus)
        .replace(/{{consultant_email}}/gi, consultantEmail)
        .replace(/{{consultant_name}}/gi, consultantName)
        .replace(/{{deleted_by_name}}/gi, deletedByName)
        .replace(/{{deleted_by_email}}/gi, deletedByEmail)
        .replace(/{{deletion_date}}/gi, new Date().toLocaleDateString())
        .replace(/{{terms_link}}/gi, process.env.TERMS_LINK || "#");
    } catch (err) {
      console.error("Error reading email template:", err);

      // Fallback HTML template
      htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9ff00;">Application ${applicationId} Deleted</h2>
        <p>Hi ${consultantName},</p>
        <p>An application has been deleted from the system.</p>
        <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid #c9ff00;">
          <p><strong>Application ID:</strong> ${applicationId}</p>
          <p><strong>Application Date:</strong> ${applicationDate}</p>
          <p><strong>Program Name:</strong> ${programName}</p>
          <p><strong>University:</strong> ${universityName}</p>
          <p><strong>Student Email:</strong> ${studentEmail}</p>
          <p><strong>Student Name:</strong> ${studentName}</p>
          <p><strong>Application Status:</strong> ${applicationStatus}</p>
          <p><strong>Consultant Email:</strong> ${consultantEmail}</p>
          <p><strong>Deleted By:</strong> ${deletedByName} (${deletedByEmail})</p>
          <p><strong>Reason:</strong> ${reason || "Not specified"}</p>
        </div>
        <p>This application has been permanently removed from the system.</p>
      </div>
    `;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${process.env.EMAIL_USER}>`,
      to,
      subject: mailSubject,
      html: htmlTemplate,
    });

    return info;
  }

  static async sendBookingConfirmationEmail({
    to,
    studentName,
    studentEmail,
    consultantName,
    consultantEmail,
    applicationName,
    universityName,
    bookingDate,
    bookingId,
    greetingMessage,
    dashboardLink,
    supportEmail,
  }) {
    const mailSubject = `Booking Confirmed - ${applicationName} - BorderlessEDU`;

    const templatePath = path.join(
      process.cwd(),
      "templates",
      "booking-confirmation.html",
    );

    let htmlTemplate;

    try {
      const fileContent = await fs.readFile(templatePath, "utf-8");

      // Replace all template variables
      htmlTemplate = fileContent
        .replace(/{{student_name}}/gi, studentName || "")
        .replace(/{{student_email}}/gi, studentEmail || "")
        .replace(/{{consultant_name}}/gi, consultantName || "")
        .replace(/{{consultant_email}}/gi, consultantEmail || "")
        .replace(/{{application_name}}/gi, applicationName || "")
        .replace(
          /{{university_name}}/gi,
          universityName || "University not specified",
        )
        .replace(
          /{{booking_date}}/gi,
          bookingDate || new Date().toLocaleDateString(),
        )
        .replace(/{{booking_id}}/gi, bookingId || "")
        .replace(
          /{{greeting_message}}/gi,
          greetingMessage ||
            `Your booking with ${consultantName} has been confirmed!`,
        )
        .replace(
          /{{dashboard_link}}/gi,
          dashboardLink || process.env.DASHBOARD_URL || "#",
        )
        .replace(
          /{{support_email}}/gi,
          supportEmail || process.env.SUPPORT_EMAIL || "support@borderless.edu",
        )
        .replace(/{{current_year}}/gi, new Date().getFullYear())
        .replace(/{{terms_link}}/gi, process.env.TERMS_LINK || "#")
        .replace(/{{privacy_link}}/gi, process.env.PRIVACY_LINK || "#");
    } catch (err) {
      console.error("Error reading booking confirmation template:", err);

      // Fallback HTML template
      htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #101010; color: white;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #c9ff00; font-family: 'Cinzel Decorative', serif; margin: 0;">
            borderless<span style="color: white;">edu!</span>
          </h1>
        </div>
        
        <div style="background-color: #252424; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #c9ff00; text-align: center;">${greetingMessage || "Booking Confirmed!"} 🎉</h2>
          
          <div style="background-color: rgba(201, 255, 0, 0.1); border: 2px solid #c9ff00; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #c9ff00; margin-top: 0;">Booking Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold; width: 40%;">Booking ID:</td>
                <td style="padding: 8px 0;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">Student Name:</td>
                <td style="padding: 8px 0;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">Student Email:</td>
                <td style="padding: 8px 0;">${studentEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">Consultant:</td>
                <td style="padding: 8px 0;">${consultantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">Program:</td>
                <td style="padding: 8px 0;">${applicationName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">University:</td>
                <td style="padding: 8px 0;">${universityName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #c9ff00; font-weight: bold;">Booking Date:</td>
                <td style="padding: 8px 0;">${bookingDate}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink || "#"}" 
               style="background-color: #c9ff00; color: #101010; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                      display: inline-block; font-size: 16px;">
              VIEW IN DASHBOARD
            </a>
          </div>
          
          <p style="color: #cccccc; font-size: 14px; line-height: 1.6;">
            ${consultantName} will contact you shortly to discuss your application for 
            ${applicationName} at ${universityName}.
          </p>
          
          <p style="color: #999999; font-size: 12px; margin-top: 30px; border-top: 1px solid #333; padding-top: 15px;">
            Need help? Contact: ${supportEmail || "support@borderless.edu"}
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} BorderlessEDU. All rights reserved.</p>
        </div>
      </div>
    `;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${process.env.EMAIL_USER}>`,
      to,
      subject: mailSubject,
      html: htmlTemplate,
    });

    return info;
  }
  static async sendMessageReceivedEmail({
    to,
    senderName,
    senderEmail,
    messageContent,
    messageDate,
    messageTime,
    url,
  }) {
    const mailSubject = `New Message from ${senderName} - BorderlessEDU`;

    const templatePath = path.join(
      process.cwd(),
      "templates",
      "message-received.html",
    );

    let htmlTemplate;

    try {
      const fileContent = await fs.readFile(templatePath, "utf-8");

      // Replace all template variables
      htmlTemplate = fileContent
        .replace(/{{sender_name}}/gi, senderName || "")
        .replace(/{{sender_email}}/gi, senderEmail || "")
        .replace(/{{message_content}}/gi, messageContent || "")
        .replace(
          /{{message_date}}/gi,
          messageDate || new Date().toLocaleDateString(),
        )
        .replace(
          /{{message_time}}/gi,
          messageTime || new Date().toLocaleTimeString(),
        )
        .replace(/{{current_year}}/gi, new Date().getFullYear())
        .replace(/{{url}}/gi, url || "#");
    } catch (err) {
      console.error("Error reading message received template:", err);

      // Fallback HTML template
      htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #101010; color: white;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #c9ff00; font-family: 'Cinzel Decorative', serif; margin: 0;">
            borderless<span style="color: white;">edu!</span>
          </h1>
        </div>
        
        <div style="background-color: #252424; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #c9ff00; text-align: center;">New Message Received</h2>
          
          <div style="background-color: rgba(201, 255, 0, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Email:</strong> ${senderEmail}</p>
            <p><strong>Date:</strong> ${messageDate}</p>
            <p><strong>Time:</strong> ${messageTime}</p>
            ${conversationTopic ? `<p><strong>Regarding:</strong> ${conversationTopic}</p>` : ""}
          </div>
          
          <div style="border-left: 4px solid #c9ff00; background-color: rgba(201, 255, 0, 0.05); padding: 20px; margin: 20px 0;">
            <h3 style="color: #c9ff00; margin-top: 0;">Message:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${messageContent}
            </div>
          </div>
        </div>
      </div>
    `;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"BorderlessEDU" <${process.env.EMAIL_USER}>`,
      to,
      subject: mailSubject,
      html: htmlTemplate,
    });

    console.log(`Message notification email sent to ${to} from ${senderName}`);
    return info;
  }
}
