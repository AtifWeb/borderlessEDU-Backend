import Joi from "joi";
import { Base } from "./base.js";
export class ProfileJoi extends Base {
  static adminProfileSchema() {
    return Joi.object({
      name: this._name(),
      bio: this._bio(),
      avatar: this._avatar(),
      phone: this._phone(),
      address: this._address(),
      url: this._url(),
      country: this._country(),
    });
  }
  static consultantProfileSchema() {
    return Joi.object({
      name: this._name(),
      bio: this._bio(),
      avatar: this._avatar(),
      company: Joi.string().allow("").max(100).trim(),
      phone: this._phone(),
      address: this._address(),
      country: this._country(),
    });
  }
  static studentProfileSchema() {
    return Joi.object({
      bio: this._bio(),
      avatar: this._avatar(),
      phone: this._phone(),
      address: this._address(),
      country: this._country(),
      gender: Joi.string().allow("").max(20).trim(),
      nationality: Joi.string().allow("").max(50).trim(),
      date_of_birth: Joi.date().allow(null),
      city: Joi.string().allow("").max(100).trim(),
      postal_code: Joi.string().allow("").max(20).trim(),
    });
  }
}
