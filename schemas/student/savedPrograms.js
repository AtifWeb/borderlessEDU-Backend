import mongoose from "mongoose";

const savedProgramSub = new mongoose.Schema(
  {
    program_id: { type: String, default: "" },
    program_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
    saved_at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const savedProgramsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    programs: {
      type: [savedProgramSub],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

export const StudentSavedPrograms = mongoose.model(
  "StudentSavedPrograms",
  savedProgramsSchema
);
