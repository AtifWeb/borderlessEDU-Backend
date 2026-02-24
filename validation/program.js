import Joi from "joi";
import { Base } from "./base.js";
import { PROGRAM } from "../config/constants.js";

export class ProgramJoi extends Base {
  // Single schema - can be used for both create and update
  static programSchema(isUpdate = false) {
    const schema = Joi.object({
      university: Joi.object({
        name: Base._universityName(!isUpdate),
        location: Joi.object({
          country: Base._country(!isUpdate),
          city: Joi.string().trim(),
          address: Joi.string().trim(),
        }),
        website: Joi.string().uri().trim(),
        ranking: Joi.number().min(1),
      }),

      information: Joi.object({
        name: Base._programName(!isUpdate), // Required for create, optional for update
        id: Base._programId(!isUpdate),
        degree_awarded: Base._degreeAwarded(!isUpdate),
        program_type: Base._programType(!isUpdate),
        status: Joi.string()
          .valid(...PROGRAM.filters.status_options)
          .default("draft"),
        created_by: isUpdate ? Base._objectId() : Base._objectId().required(),
      }),

      faculty: Joi.object({
        faculty: Base._facultyName(!isUpdate),
        department: Base._departmentName(!isUpdate),
        faculty_id: Base._objectId(),
        department_id: Base._objectId(),
      }),

      duration: Joi.object({
        years: Base._years(),
        months: Base._months(),
        semester: Base._semester(),
        credit_required: Base._creditRequired(!isUpdate),
        weekly_commitment: Base._weeklyCommitment(),
      }),

      fees: Joi.object({
        tuition: Base._tuition(!isUpdate),
        currency: Base._currency(),
        scholarship_available: Joi.boolean().default(false),
        payment_schedule: Base._paymentSchedule(),
        additional: Joi.object({
          application_fee: Joi.number().min(0).default(0),
          health_insurance: Joi.number().min(0).default(0),
          other_fees: Joi.number().min(0).default(0),
        }).default({}),
      }),

      intakes: Joi.array()
        .items(
          Joi.object({
            intake: Base._intakeName(),
            deadline: Base._deadline(),
            status: Joi.string()
              .valid("upcoming", "ongoing", "closed", "completed")
              .default("upcoming"),
            seats: Joi.number().min(0).default(0),
            is_active: Joi.boolean().default(true),
          })
        )
        .default([]),

      details: Joi.object({
        description: Base._description(!isUpdate),
        sections: Joi.array()
          .items(
            Joi.object({
              heading: Base._sectionHeading(),
              description: Base._sectionDescription(),
              order: Joi.number().min(1).default(1),
              is_active: Joi.boolean().default(true),
            })
          )
          .default([]),
        prerequisites: Joi.array().items(Joi.string().trim()).default([]),
        learning_outcomes: Joi.array().items(Joi.string().trim()).default([]),
        career_opportunities: Joi.array()
          .items(Joi.string().trim())
          .default([]),
      }),

      accreditation: Joi.array()
        .items(
          Joi.object({
            body: Joi.string().trim(),
            status: Joi.string().trim(),
            valid_until: Joi.date(),
          })
        )
        .default([]),

      ranking: Joi.object({
        national: Joi.number(),
        international: Joi.number(),
        year: Joi.number(),
      }).default({}),

      is_active: Joi.boolean().default(true),
      is_featured: Joi.boolean().default(false),
      tags: Base._tags(),
      last_updated_by: Base._objectId(),
    });

    // For create, require the entire object
    if (!isUpdate) {
      return schema.required();
    }

    // For update, at least one field should be provided
    return schema.min(1);
  }

  // Quick aliases for convenience
  static createSchema() {
    return this.programSchema(false);
  }

  static updateSchema() {
    return this.programSchema(true);
  }

  // Simple status update schema
  static statusSchema() {
    return Joi.object({
      status: Joi.string()
        .valid(...PROGRAM.filters.status_options)
        .required(),
    });
  }

  // Simple query schema
  static querySchema() {
    return Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      status: Joi.string().valid(...PROGRAM.filters.status_options),
      program_type: Joi.string(),
      faculty: Joi.string(),
      search: Joi.string(),
      sort_by: Joi.string().default("createdAt"),
      sort_order: Joi.string().valid("asc", "desc").default("desc"),
    });
  }
}
