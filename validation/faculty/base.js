import Joi from "joi";
import { FACULTY } from "../../config/constants.js";

export class Base {
  static _name(required = true) {
    const schema = Joi.string()
      .min(FACULTY.limits.name_min)
      .max(FACULTY.limits.name_max)
      .trim();
    return required ? schema.required() : schema;
  }

  static _code(required = true) {
    const schema = Joi.string()
      .max(FACULTY.limits.code_max)
      .pattern(/^[A-Z0-9-]+$/)
      .uppercase()
      .trim();
    return required ? schema.required() : schema;
  }

  static _description() {
    return Joi.string().max(FACULTY.limits.description_max).trim().allow("");
  }

  static _contactEmail() {
    return Joi.string().email().lowercase().trim().allow("");
  }

  static _website() {
    return Joi.string()
      .uri({ scheme: ["http", "https"] })
      .trim()
      .allow("");
  }

  static _dean() {
    return Joi.string()
    .allow("");
  }

  static _isActive() {
    return Joi.boolean().default(true);
  }

  static _objectId(required = false) {
    const schema = Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow("");
    return required ? schema.required() : schema;
  }
}
