import { Profile } from "../../schemas/consultant/profile.js";
import { Consultant } from "../../schemas/consultant/consultant.js"; // Need Admin model to get user by email
import { ProfileJoi } from "../../validation/profile.js";
import { Response } from "../../utils/Response.js";
import { RESPONSE_MESSAGES, PROFILE } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";

export class ProfileController {
  // Get profile by email
  async getProfileByEmail(req, res) {
    try {
      const { email } = req.params;

      const user = await MongoService.findOne(Consultant, { email });

      if (!user) {
        return Response.error(res, RESPONSE_MESSAGES.user_not_found, 404);
      }

      const profile = await MongoService.findOneWithPopulate(
        Profile,
        { user: user._id },
        "user",
      );

      if (!profile) {
        return Response.error(res, PROFILE.GENERAL.not_found, 404);
      }

      Response.success(res, PROFILE.GENERAL.fetch_success, {
        profile: {
          id: profile._id,
          bio: profile.bio || "",
          company: profile.company || "",
          phone: profile.phone || "",
          address: profile.address || "",
          country: profile.country || "",
          avatar: profile.avatar || "",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      });
    } catch (err) {
      console.error("Get Profile Error:", err);
      Response.error(res, PROFILE.GENERAL.fetch_failed, 500);
    }
  }

  async updateProfileByEmail(req, res) {
    try {
      const email = req.user.email;
      const updateData = req.body.data;

      // Validate profile data
      const { error, value } =
        ProfileJoi.consultantProfileSchema().validate(updateData);
      if (error) {
        return Response.error(res, PROFILE.GENERAL.validation_error, 400);
      }

      // Find user by email
      const user = await MongoService.findOne(Consultant, { email });

      if (!user) {
        return Response.error(res, RESPONSE_MESSAGES.user_not_found, 404);
      }

      // Find existing profile
      const existingProfile = await MongoService.findOne(Profile, {
        user: user._id,
      });

      if (!existingProfile) {
        return Response.error(res, PROFILE.GENERAL.not_found, 404);
      }

      // Update profile
      const updatedProfile = await MongoService.updateById(
        Profile,
        existingProfile._id,
        value,
      );

      // If name was provided, update the Consultant user's name as well
      if (value.name) {
        await MongoService.updateOne(
          Consultant,
          { _id: user._id },
          { name: value.name },
        );
        user.name = value.name;
      }

      Response.success(res, PROFILE.GENERAL.update_success, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        profile: {
          id: updatedProfile._id,
          bio: updatedProfile.bio,
          company: updatedProfile.company,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          country: updatedProfile.country,
          avatar: updatedProfile.avatar,
          updatedAt: updatedProfile.updatedAt,
        },
      });
    } catch (err) {
      console.error("Update Profile Error:", err);
      Response.error(res, PROFILE.GENERAL.update_failed, 500);
    }
  }
}
