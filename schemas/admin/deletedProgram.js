import mongoose from "mongoose";

const deletedProgramSchema = new mongoose.Schema(
  {
    original_program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },

    information: {
      name: String,
      id: String,
      degree_awarded: String,
      program_type: [String],
      status: String,
      created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    },

    faculty: {
      faculty: String,
      department: String,
      faculty_id: { type: String },
      department_id: { type: String },
    },

    duration: {
      years: Number,
      months: Number,
      semester: Number,
      credit_required: Number,
      weekly_commitment: String,
    },

    fees: {
      tuition: Number,
      currency: String,
      scholarship_available: Boolean,
      payment_schedule: String,
      additional: {
        application_fee: Number,
        health_insurance: Number,
        other_fees: Number,
      },
    },

    intakes: [mongoose.Schema.Types.Mixed],
    details: mongoose.Schema.Types.Mixed,
    accreditation: [mongoose.Schema.Types.Mixed],
    ranking: mongoose.Schema.Types.Mixed,

    // Metadata
    is_active: Boolean,
    is_featured: Boolean,
    tags: [String],

    // Deletion metadata
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    deleted_at: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

deletedProgramSchema.index({ "information.id": 1 });

export const DeletedProgram = mongoose.model(
  "DeletedProgram",
  deletedProgramSchema
);
