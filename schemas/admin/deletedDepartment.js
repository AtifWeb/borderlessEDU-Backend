import mongoose from "mongoose";

const deletedDepartmentSchema = new mongoose.Schema(
  {
    original_department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: String,
    code: String,
    description: String,
    faculty_id: mongoose.Schema.Types.Mixed,
    is_active: Boolean,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    deleted_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

deletedDepartmentSchema.index({ code: 1 });

export const DeletedDepartment = mongoose.model(
  "DeletedDepartment",
  deletedDepartmentSchema
);
