import mongoose from "mongoose";

const consultantSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["consultant", "admin"],
      default: "consultant",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual to link the consultant to their profile (ConsultantProfile)
consultantSchema.virtual("profile", {
  ref: "ConsultantProfile",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

export const Consultant = mongoose.model("Consultant", consultantSchema);
