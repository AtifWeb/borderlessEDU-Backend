import { Consultant } from "../../schemas/consultant/consultant.js";
import { Profile } from "../../schemas/consultant/profile.js";
import { AuthJoi } from "../../validation/auth.js";
import { Response } from "../../utils/Response.js";
import bcrypt from "bcryptjs";
import { RESPONSE_MESSAGES } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";
import { JwtService } from "../../services/JwtService.js";
import { EmailService } from "../../services/EmailService.js";

export class AuthController {
  // User registration
  async signUp(req, res) {
    try {
      // Validate request
      const { error, value } = AuthJoi.registerSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      const { name, email, password, company } = value;

      // Check existing user
      const existingUser = await MongoService.findOne(Consultant, { email });
      if (existingUser)
        return Response.error(
          res,
          RESPONSE_MESSAGES.email_registered_already,
          400,
        );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user via MongoService
      const newUser = await MongoService.create(Consultant, {
        name,
        email,
        password: hashedPassword,
      });

      // Create profile via MongoService (attach company if provided)
      const profilePayload = { user: newUser._id };
      if (company) profilePayload.company = company;
      const profile = await MongoService.create(Profile, profilePayload);

      // Return response
      Response.success(res, RESPONSE_MESSAGES.user_registered, {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileId: profile._id,
      });
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }
  // User login
  async signIn(req, res) {
    try {
      // 1️⃣ Validate request body
      const { error, value } = AuthJoi.loginSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      const { email, password } = value;

      // 2️⃣ Find user
      const user = await MongoService.findOne(Consultant, { email });
      if (!user)
        return Response.error(res, RESPONSE_MESSAGES.invalid_credentials, 401);

      // 3️⃣ Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return Response.error(res, RESPONSE_MESSAGES.invalid_credentials, 401);

      // 4️⃣ Generate JWT

      const payload = { id: user._id, email: user.email, role: user.role };
      const token = JwtService._generateToken(payload);

      // 5️⃣ Optional: fetch profile ID
      const profile = await MongoService.findOne(Profile, { user: user._id });
      // fetch payment status
      const { ConsultantPayment } =
        await import("../../schemas/consultant/payment.js");
      const payment = await MongoService.findOne(ConsultantPayment, {
        consultant: user._id,
      });

      // 6️⃣ Send response
      const now = new Date();
      const inTrial = payment?.trial_ends_at && payment.trial_ends_at > now;
      Response.success(res, RESPONSE_MESSAGES.login_success, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: profile?._id || null,
        token,
        payment: {
          paid: payment?.paid || false,
          in_trial: !!inTrial,
          trial_ends_at: payment?.trial_ends_at || null,
          next_payment_date: payment?.next_payment_date || null,
        },
      });
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }

  // Forgot password - send reset link for consultant
  async forgotPassword(req, res) {
    try {
      const { email } = req.body || {};
      if (!email) return Response.error(res, "Email is required", 400);

      const user = await MongoService.findOne(Consultant, { email });

      if (!user) {
        return Response.success(
          res,
          "User not found with the provided email",
          {},
        );
      }

      const payload = { id: user._id, email: user.email };
      const token = JwtService._generateToken(payload);

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendBase}/screens/auth/reset-password/consultant?token=${token}&id=${user._id}`;

      try {
        await EmailService.sendResetPasswordEmail({
          to: user.email,
          resetUrl,
          name: user.name,
        });
      } catch (mailErr) {
        console.error("Failed to send consultant reset email:", mailErr);
      }

      const data = process.env.NODE_ENV === "production" ? {} : { resetUrl };
      Response.success(
        res,
        RESPONSE_MESSAGES.reset_link_sent ||
          "If an account exists, a reset link was sent to the provided email",
        data,
      );
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }

  // Reset password for consultant using token
  async resetPassword(req, res) {
    try {
      const { token, id, password } = req.body || {};
      if (!token || !id || !password)
        return Response.error(res, "token, id, and password are required", 400);

      let payload;
      try {
        payload = JwtService._verifyToken(token);
      } catch (e) {
        return Response.error(res, "Invalid or expired token", 401);
      }

      if (!payload || String(payload.id) !== String(id)) {
        return Response.error(res, "Invalid token payload", 401);
      }

      const user = await MongoService.findOne(Consultant, {
        _id: id,
        email: payload.email,
      });
      if (!user) return Response.error(res, "User not found", 404);

      const hashedPassword = await bcrypt.hash(password, 10);
      await MongoService.updateOne(
        Consultant,
        { _id: user._id },
        {
          password: hashedPassword,
        },
      );

      Response.success(
        res,
        RESPONSE_MESSAGES.password_changed || "Password changed successfully",
        {},
      );
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }
}
