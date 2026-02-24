import Joi from "joi";
import { Base } from "./base.js";

export class FacultyJoi extends Base {
  static createSchema() {
    return Joi.object({
      name: this._name(),
      code: this._code(),
      description: this._description(),
      dean: this._dean(),
      contact_email: this._contactEmail(),
      website: this._website(),
      created_by: this._objectId(true),
    });
  }

  static updateSchema() {
    return Joi.object({
      name: this._name(false),
      code: this._code(false),
      description: this._description(),
      dean: this._dean(),
      contact_email: this._contactEmail(),
      website: this._website(),
      is_active: this._isActive(),
    }).min(1);
  }

  static querySchema() {
    return Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      search: Joi.string().trim(),
      is_active: Joi.boolean(),
      sort_by: Joi.string()
        .valid("name", "code", "createdAt", "updatedAt")
        .default("name"),
      sort_order: Joi.string().valid("asc", "desc").default("asc"),
    });
  }
}
