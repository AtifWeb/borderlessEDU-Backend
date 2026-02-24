import mongoose from "mongoose";

const adminSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" },
});

export const Admin = mongoose.model("Admin", adminSchema);
