import crypto from "crypto";
import { EmailService } from "../../services/EmailService.js";
import { MongoService } from "../../services/MongoService.js";
import { Response } from "../../utils/Response.js";
import { Otp } from "../../schemas/global/otp.js";
import { RESPONSE_MESSAGES } from "../../config/constants.js";

export class OtpController {
  // Generate and send OTP
  async sendOtp(req, res) {
    try {
      const { email } = req.body;

      // Generate 6-digit OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();

      // Save OTP in DB
      await MongoService.create(Otp, {
        email,
        otp: otpCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      // Send email
      await EmailService.sendEmail({
        to: email,
        subject: "Your OTP Code",
        otpCode: otpCode,
      });

      Response.success(res, RESPONSE_MESSAGES.otp_sent);
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }

  // Verify OTP
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const otpEntry = await MongoService.findOne(Otp, { email, otp });

      if (!otpEntry)
        return Response.error(res, RESPONSE_MESSAGES.invalid_otp, 400);

      if (otpEntry.expiresAt < Date.now())
        return Response.error(res, RESPONSE_MESSAGES.otp_expired, 400);

      Response.success(res, RESPONSE_MESSAGES.otp_verified);
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }
}
