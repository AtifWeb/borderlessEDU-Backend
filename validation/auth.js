import Joi from "joi";
import { Base } from "./base.js";
export class AuthJoi extends Base {
  // schema registered
  static registerSchema() {
    return Joi.object({
      name: this._name(),
      company: Joi.string().allow("").max(100).trim(),
      email: this._email(),
      password: this._password(),
      confirmPassword: this._confirmPassword(),
    });
  }

  //   login schema
  static loginSchema() {
    return Joi.object({
      email: this._email(),
      password: this._password(),
    });
  }
}
