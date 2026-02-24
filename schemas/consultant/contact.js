import mongoose from "mongoose";

const consultantContactSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant",
      required: true,
    },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "seen", "responded", "closed"],
      default: "new",
    },
    response: { type: String, default: "" },
    contacted_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

consultantContactSchema.index({ consultant: 1, student: 1 });

export const ConsultantContact = mongoose.model(
  "ConsultantContact",
  consultantContactSchema
);
