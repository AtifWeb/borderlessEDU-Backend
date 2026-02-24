import mongoose from "mongoose";

const fileSubSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "" },
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: true },
);

const documentsSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    files: {
      type: [fileSubSchema],
      default: [],
    },
    main_file: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false },
);

export const StudentDocuments = mongoose.model(
  "StudentDocuments",
  documentsSchema,
);
