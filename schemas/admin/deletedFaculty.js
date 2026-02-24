import mongoose from "mongoose";

const deletedFacultySchema = new mongoose.Schema(
  {
    original_faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    name: String,
    code: String,
    description: String,
    contact_email: String,
    website: String,
    dean: mongoose.Schema.Types.Mixed,

    // Metadata
    is_active: Boolean,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    // Deletion metadata
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    deleted_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

deletedFacultySchema.index({ code: 1 });

export const DeletedFaculty = mongoose.model(
  "DeletedFaculty",
  deletedFacultySchema
);
