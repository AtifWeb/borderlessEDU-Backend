import Joi from "joi";

export class StudentDocumentsJoi {
  static createSchema() {
    return Joi.object({
      created_by: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
      title: Joi.string().optional(),
      files: Joi.array().items(Joi.string().uri()).optional().default([]),
      fileNames: Joi.array().items(Joi.string()).optional(),
      main_file: Joi.string().uri().allow("").optional(),
    });
  }

  static addFilesSchema() {
    return Joi.object({
      files: Joi.array().items(Joi.string().uri()).min(1).required(),
      fileNames: Joi.array().items(Joi.string()).optional(),
    });
  }
}
