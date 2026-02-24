import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: false },
    countryCode: { type: String, required: false },
    website: { type: String, required: false },
    address: { type: String, required: false },
    contact: { type: String, required: false },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant",
      required: true,
    },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const University = mongoose.model("University", universitySchema);
