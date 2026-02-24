import Joi from "joi";

export class StudentApplicationJoi {
  static programDetails() {
    return Joi.object({
      program_applying: Joi.string().required(),
      program_id: Joi.string().allow("").optional(),
      program_ref: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .allow("")
        .optional(),
      intake_period: Joi.string().allow("").optional(),
      study_mode: Joi.string().allow("").optional(),
      funding_method: Joi.string().allow("").optional(),
      accommodation_needed: Joi.boolean().default(false),
      preferred_housing_type: Joi.string().allow("").optional(),
    });
  }

  static personalInformation() {
    return Joi.object({
      student_name: Joi.string().required(),
      student_email: Joi.string().email().required(),
      gender: Joi.string().allow("").optional(),
      nationality: Joi.string().allow("").optional(),
      date_of_birth: Joi.date().optional(),
    });
  }

  static contactInformation() {
    return Joi.object({
      email_address: Joi.string().email().allow("").optional(),
      phone_number: Joi.string().allow("").optional(),
      current_address: Joi.string().allow("").optional(),
      country: Joi.string().allow("").optional(),
      city: Joi.string().allow("").optional(),
      postal_code: Joi.string().allow("").optional(),
    });
  }

  static universityDetails() {
    return Joi.object({
      university_name: Joi.string().allow("").optional(),
      university_location: Joi.object({
        country: Joi.string().allow("").optional(),
        city: Joi.string().allow("").optional(),
        address: Joi.string().allow("").optional(),
      }).optional(),
      university_website: Joi.string().allow("").optional(),
      university_ranking: Joi.number().optional(),
    });
  }

  static educationRecord() {
    return Joi.object({
      institution_name: Joi.string().allow("").optional(),
      field_of_study: Joi.string().allow("").optional(),
      education_level: Joi.string().allow("").optional(),
      start_date: Joi.date().optional(),
      end_date: Joi.date().optional(),
      gpa_cgpa: Joi.number().optional(),
      grading_system: Joi.string().allow("").optional(),
    });
  }

  static createSchema() {
    return Joi.object({
      created_by: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
      consultant: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          "any.required": "consultant is required and must be a single id",
        }),
      related_program: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      program_details: this.programDetails().required(),
      university_details: this.universityDetails().optional(),
      documents: Joi.array().items(Joi.any()).optional().default([]),
      personal_information: this.personalInformation().required(),
      contact_information: this.contactInformation().required(),
      current_education: this.educationRecord().required(),
      previous_education: Joi.array().items(this.educationRecord()).default([]),
      status: Joi.string()
        .valid("draft", "submitted", "review", "accepted", "rejected")
        .optional(),
    });
  }

  static updateSchema() {
    return Joi.object({
      related_program: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      documents: Joi.array().items(Joi.any()).optional(),
      program_details: this.programDetails().optional(),
      university_details: this.universityDetails().optional(),
      personal_information: this.personalInformation().optional(),
      contact_information: this.contactInformation().optional(),
      current_education: this.educationRecord().optional(),
      previous_education: Joi.array().items(this.educationRecord()).optional(),
      status: Joi.string()
        .valid("draft", "submitted", "review", "accepted", "rejected")
        .optional(),
    }).min(1);
  }
}
