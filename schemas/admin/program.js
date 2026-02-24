import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    university: {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
      location: {
        country: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        address: {
          type: String,
          trim: true,
        },
      },
      website: {
        type: String,
        trim: true,
      },
      ranking: {
        type: Number,
        min: 1,
      },
    },

    information: {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
      id: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 50,
      },
      degree_awarded: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
      program_type: [
        {
          type: String,
          enum: ["full time", "half time", "part time", "online", "hybrid"],
          required: true,
        },
      ],
      status: {
        type: String,
        enum: ["active", "inactive", "draft", "archived"],
        default: "draft",
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
      },
    },

    faculty: {
      faculty: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 150,
      },
      department: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 150,
      },
      faculty_id: {
        type: String,
      },
      department_id: {
        type: String,
      },
    },

    duration: {
      years: {
        type: Number,
        min: 0,
        max: 10,
      },
      months: {
        type: Number,
        min: 0,
        max: 11,
      },
      semester: {
        type: Number,
        min: 1,
        max: 12,
      },
      credit_required: {
        type: Number,
        required: true,
        min: 1,
        max: 200,
      },
      weekly_commitment: {
        type: String,
        trim: true,
        maxlength: 50,
      },
    },

    fees: {
      tuition: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "INR", "PKR", "CAD", "AUD"],
      },
      scholarship_available: {
        type: Boolean,
        default: false,
      },
      payment_schedule: {
        type: String,
        enum: ["monthly", "quarterly", "semester", "yearly", "one-time"],
        default: "semester",
      },
      additional: {
        application_fee: {
          type: Number,
          min: 0,
          default: 0,
        },
        health_insurance: {
          type: Number,
          min: 0,
          default: 0,
        },
        other_fees: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
    },

    intakes: [
      {
        intake: {
          type: String,
          required: true,
          trim: true,
        },
        deadline: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["upcoming", "ongoing", "closed", "completed"],
          default: "upcoming",
        },
        seats: {
          type: Number,
          min: 0,
          default: 0,
        },
        is_active: {
          type: Boolean,
          default: true,
        },
      },
    ],

    details: {
      description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 5000,
      },
      sections: [
        {
          heading: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
          },
          description: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 2000,
          },
          order: {
            type: Number,
            min: 1,
            default: 1,
          },
          is_active: {
            type: Boolean,
            default: true,
          },
        },
      ],
      prerequisites: [
        {
          type: String,
          trim: true,
        },
      ],
      learning_outcomes: [
        {
          type: String,
          trim: true,
        },
      ],
      career_opportunities: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // Optional fields
    accreditation: [
      {
        body: String,
        status: String,
        valid_until: Date,
      },
    ],

    // Metadata
    is_active: {
      type: Boolean,
      default: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    last_updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

programSchema.index({ "information.id": 1 }, { unique: true });
programSchema.index({ "faculty.faculty": 1 });
programSchema.index({ "faculty.department": 1 });
programSchema.index({ "information.program_type": 1 });
programSchema.index({ "information.status": 1 });
programSchema.index({ "fees.tuition": 1 });
programSchema.index({ "intakes.deadline": 1 });
programSchema.index({ tags: 1 });

export const Program = mongoose.model("Program", programSchema);
