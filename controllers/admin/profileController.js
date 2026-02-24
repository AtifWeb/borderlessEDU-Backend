import { Profile } from "../../schemas/admin/profile.js";
import { Admin } from "../../schemas/admin/admin.js"; // Need Admin model to get user by email
import { ProfileJoi } from "../../validation/profile.js";
import { Response } from "../../utils/Response.js";
import { RESPONSE_MESSAGES, PROFILE } from "../../config/constants.js";
import { MongoService } from "../../services/MongoService.js";

export class ProfileController {
  // Get profile by email
  async getProfileByEmail(req, res) {
    try {
      const { email } = req.params;

      const user = await MongoService.findOne(Admin, { email });

      if (!user) {
        return Response.error(res, RESPONSE_MESSAGES.user_not_found, 404);
      }

      const profile = await MongoService.findOneWithPopulate(
        Profile,
        { user: user._id },
        "user",
      );

      if (!profile) {
        return Response.error(res, PROFILE.GENERAL.NOT_FOUND, 404);
      }

      Response.success(res, PROFILE.GENERAL.FETCH_SUCCESS, {
        profile: {
          id: profile._id,
          bio: profile.bio || "",
          phone: profile.phone || "",
          address: profile.address || "",
          country: profile.country || "",
          url: profile.url || "",
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
      Response.error(res, PROFILE.GENERAL.FETCH_FAILED, 500);
    }
  }

  async updateProfileByEmail(req, res) {
    try {
      const email = req.user.email;
      const updateData = req.body.data;

      // Validate profile data
      const { error, value } =
        ProfileJoi.adminProfileSchema().validate(updateData);
      if (error) {
        return Response.error(res, PROFILE.GENERAL.VALIDATION_ERROR, 400);
      }

      // Find user by email
      const user = await MongoService.findOne(Admin, { email });

      if (!user) {
        return Response.error(res, RESPONSE_MESSAGES.user_not_found, 404);
      }

      // Update user name if provided
      if (value.name) {
        await MongoService.updateById(Admin, user._id, { name: value.name });
        user.name = value.name; // Update local reference
      }

      // Find existing profile
      const existingProfile = await MongoService.findOne(Profile, {
        user: user._id,
      });

      if (!existingProfile) {
        return Response.error(res, PROFILE.GENERAL.NOT_FOUND, 404);
      }

      // Prepare profile update data (exclude name)
      const { name, ...profileData } = value;

      // Update profile
      const updatedProfile = await MongoService.updateById(
        Profile,
        existingProfile._id,
        profileData,
      );

      Response.success(res, PROFILE.GENERAL.UPDATE_SUCCESS, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        profile: {
          id: updatedProfile._id,
          bio: updatedProfile.bio,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          country: updatedProfile.country,
          url: updatedProfile.url,
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
