import { Admin } from "../../schemas/admin/admin.js";
import { Profile } from "../../schemas/admin/profile.js";
import { AuthJoi } from "../../validation/auth.js";
import { Response } from "../../utils/Response.js";
import bcrypt from "bcryptjs";
import { RESPONSE_MESSAGES } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";
import { JwtService } from "../../services/JwtService.js";

export class AuthController {
  // User registration
  async signUp(req, res) {
    try {
      // Validate request
      const { error, value } = AuthJoi.registerSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      const { name, email, password } = value;

      // Check existing user
      const existingUser = await MongoService.findOne(Admin, { email });
      if (existingUser)
        return Response.error(
          res,
          RESPONSE_MESSAGES.email_registered_already,
          400
        );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user via MongoService
      const newUser = await MongoService.create(Admin, {
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
  // User login
  async signIn(req, res) {
    try {
      // 1️⃣ Validate request body
      const { error, value } = AuthJoi.loginSchema().validate(req.body);
      if (error) return Response.error(res, error.details[0].message, 400);

      const { email, password } = value;

      // 2️⃣ Find user
      const user = await MongoService.findOne(Admin, { email });
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
}
