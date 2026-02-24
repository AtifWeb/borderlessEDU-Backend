// models/faculty.js
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      maxlength: 20,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    dean: {
      type: String,
      required: true,
    },
    contact_email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Faculty = mongoose.model("Faculty", facultySchema);
