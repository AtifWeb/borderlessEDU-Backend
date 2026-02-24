import Joi from "joi";

export class ConsultantContactJoi {
  static createSchema() {
    return Joi.object({
      consultant: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
      application: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .allow(""),
      message: Joi.string().min(1).required(),
    });
  }

  static respondSchema() {
    return Joi.object({
      response: Joi.string().min(1).required(),
      status: Joi.string().valid("seen", "responded", "closed").optional(),
    });
  }
}
