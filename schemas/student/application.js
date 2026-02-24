import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant",
    },

    related_program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },

    program_details: {
      program_applying: { type: String, required: true },
      program_id: { type: String },
      program_ref: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
      intake_period: { type: String },
      study_mode: { type: String },
      funding_method: { type: String },
      accommodation_needed: { type: Boolean, default: false },
      preferred_housing_type: { type: String },
    },

    university_details: {
      university_name: { type: String },
      university_location: {
        country: { type: String },
        city: { type: String },
        address: { type: String },
      },
      university_website: { type: String },
      university_ranking: { type: Number },
    },

    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    personal_information: {
      student_name: { type: String, required: true },
      student_email: { type: String, required: true },
      gender: { type: String },
      nationality: { type: String },
      date_of_birth: { type: Date },
    },

    contact_information: {
      email_address: { type: String },
      phone_number: { type: String },
      current_address: { type: String },
      country: { type: String },
      city: { type: String },
      postal_code: { type: String },
    },

    current_education: {
      institution_name: { type: String },
      field_of_study: { type: String },
      education_level: { type: String },
      start_date: { type: Date },
      end_date: { type: Date },
      gpa_cgpa: { type: Number },
      grading_system: { type: String },
    },

    previous_education: [
      {
        institution_name: String,
        field_of_study: String,
        education_level: String,
        start_date: Date,
        end_date: Date,
        gpa_cgpa: Number,
        grading_system: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "submitted",
        "review",
        "interview",
        "accepted",
        "visa",
        "enrolled",
        "rejected",
      ],
      default: "submitted",
    },
  },
  { timestamps: true },
);

applicationSchema.index({ created_by: 1 });

export const Application = mongoose.model("Application", applicationSchema);
