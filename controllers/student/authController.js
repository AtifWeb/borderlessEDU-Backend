import { Student } from "../../schemas/student/student.js";
import { Profile } from "../../schemas/student/profile.js";
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

      const { name, email, password } = value;

      // Check existing user
      const existingUser = await MongoService.findOne(Student, { email });
      if (existingUser)
        return Response.error(
          res,
          RESPONSE_MESSAGES.email_registered_already,
          400,
        );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user via MongoService
      const newUser = await MongoService.create(Student, {
        name,
        email,
        password: hashedPassword,
      });

      // Create profile via MongoService
      const profile = await MongoService.create(Profile, {
        user: newUser._id,
      });

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

  // Google Sign-In using id_token from client
  async googleSignIn(req, res) {
    try {
      const { idToken } = req.body || {};
      if (!idToken) return Response.error(res, "idToken is required", 400);

      // Verify token with Google tokeninfo endpoint
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
      let tokenInfo;
      try {
        const r = await fetch(verifyUrl);
        if (!r.ok) {
          const txt = await r.text();
          console.error("Google token verification failed:", txt);
          return Response.error(res, "Invalid Google token", 401);
        }
        tokenInfo = await r.json();
      } catch (err) {
        console.error("Failed to verify Google token:", err);
        return Response.error(res, "Failed to verify Google token", 500);
      }

      const email = tokenInfo.email;
      const name = tokenInfo.name || tokenInfo.given_name || "";

      if (!email)
        return Response.error(res, "Google token did not contain email", 400);

      // Find or create student
      let user = await MongoService.findOne(Student, { email });
      if (!user) {
        // create a random password for social accounts
        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = await MongoService.create(Student, {
          name,
          email,
          password: hashedPassword,
        });
        // create profile
        await MongoService.create(Profile, { user: user._id });
      }

      // generate jwt
      const payload = { id: user._id, email: user.email, role: user.role };
      const token = JwtService._generateToken(payload);

      const profile = await MongoService.findOne(Profile, { user: user._id });

      Response.success(res, "Google sign-in successful", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: profile?._id || null,
        token,
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
      const user = await MongoService.findOne(Student, { email });
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

      // 6️⃣ Send response
      Response.success(res, RESPONSE_MESSAGES.login_success, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: profile?._id || null,
        token,
      });
    } catch (err) {
      console.error(err);
      Response.error(res, RESPONSE_MESSAGES.server_error, 500);
    }
  }

  // Forgot password - send reset link (does not send email directly)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body || {};
      if (!email) return Response.error(res, "Email is required", 400);

      const user = await MongoService.findOne(Student, { email });

      // Always return success message to avoid account enumeration
      if (!user) {
        return Response.error(
          res,
          "User not found with the provided email",
          {},
        );
      }

      // Generate reset token
      const payload = { id: user._id, email: user.email };
      const token = JwtService._generateToken(payload);

      const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
      const resetUrl = `${frontendBase}/screens/auth/reset-password/student?token=${token}&id=${user._id}`;

      // Attempt to send reset email (do not leak account existence)
      try {
        await EmailService.sendResetPasswordEmail({
          to: user.email,
          resetUrl,
          name: user.name,
        });
      } catch (mailErr) {
        console.error("Failed to send reset email:", mailErr);
      }

      // For security, do not include the URL in production responses.
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

  // Reset password using token
  async resetPassword(req, res) {
    try {
      const { token, id, password } = req.body || {};
      if (!token || !id || !password)
        return Response.error(res, "token, id and password are required", 400);

      // verify token
      let payload;

      try {
        payload = JwtService._verifyToken(token);
      } catch (e) {
        return Response.error(res, "Invalid or expired token", 401);
      }
      console.log(payload);
      if (!payload || String(payload.id) !== String(id)) {
        return Response.error(res, "Invalid token payload", 401);
      }
      let email = payload.email;
      // Find user
      const user = await MongoService.findOne(Student, { _id: id, email });
      if (!user) return Response.error(res, "User not found", 404);

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(password, 10);
      await MongoService.updateOne(
        Student,
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
