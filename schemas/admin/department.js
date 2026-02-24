import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      maxlength: 20,
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    contact_email: {
      type: String,
      lowercase: true,
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

// Compound unique index for department code within a faculty
departmentSchema.index({ faculty_id: 1, code: 1 }, { unique: true });

export const Department = mongoose.model("Department", departmentSchema);
