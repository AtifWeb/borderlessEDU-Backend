import Joi from "joi";
import { AUTH, PROFILE, PROGRAM } from "../config/constants.js";

export class Base {
  // Email validation
  static _email() {
    return Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": AUTH.EMAIL.empty,
        "string.email": AUTH.EMAIL.email,
        "any.required": AUTH.EMAIL.required,
      });
  }

  static _password() {
    return Joi.string().min(6).max(30).required().messages({
      "string.empty": AUTH.PASSWORD.empty,
      "string.min": AUTH.PASSWORD.min,
      "string.max": AUTH.PASSWORD.max,
      "any.required": AUTH.PASSWORD.required,
    });
  }

  static _confirmPassword() {
    return Joi.string().required().valid(Joi.ref("password")).messages({
      "any.only": AUTH.CONFIRM_PASSWORD.match,
      "string.empty": AUTH.CONFIRM_PASSWORD.empty,
      "any.required": AUTH.CONFIRM_PASSWORD.required,
    });
  }

  static _name() {
    return Joi.string().min(2).max(50).required().messages({
      "string.empty": AUTH.NAME.empty,
      "string.min": AUTH.NAME.min,
      "string.max": AUTH.NAME.max,
      "any.required": AUTH.NAME.required,
    });
  }

  static _bio() {
    return Joi.string().allow("").max(500).trim().messages({
      "string.max": PROFILE.BIO.max,
    });
  }

  static _url() {
    return Joi.string()
      .allow("")
      .uri({
        scheme: ["http", "https"],
        allowRelative: false,
      })
      .trim()
      .messages({
        "string.uri": PROFILE.URL.uri,
        "string.uriScheme": PROFILE.URL.scheme,
      });
  }

  static _address() {
    return Joi.string().allow("").max(200).trim().messages({
      "string.max": PROFILE.ADDRESS.max,
    });
  }

  static _phone() {
    return Joi.string()
      .allow("")
      .pattern(/^[+]?[\d\s\-()]+$/)
      .min(6)
      .max(20)
      .trim()
      .messages({
        "string.pattern.base": PROFILE.PHONE.pattern,
        "string.min": PROFILE.PHONE.min,
        "string.max": PROFILE.PHONE.max,
      });
  }

  static _avatar() {
    return Joi.string().allow("").uri().trim().messages({
      "string.uri": PROFILE.AVATAR.uri,
    });
  }

  static _country() {
    return Joi.string().allow("").max(50).trim().messages({
      "string.max": PROFILE.COUNTRY.max,
    });
  }

  static _universityName(required = true) {
    const schema = Joi.string().min(2).max(100).trim();
    return required ? schema.required() : schema;
  }
  // Required fields for creation
  static _programName(required = true) {
    const schema = Joi.string()
      .min(PROGRAM.limits.name_min)
      .max(PROGRAM.limits.name_max)
      .trim();
    return required ? schema.required() : schema;
  }

  static _programId(required = true) {
    const schema = Joi.string()
      .max(PROGRAM.limits.id_max)
      .pattern(/^[A-Z0-9_-]+$/)
      .uppercase()
      .trim();
    return required ? schema.required() : schema;
  }

  static _degreeAwarded(required = true) {
    const schema = Joi.string()
      .min(PROGRAM.limits.degree_min)
      .max(PROGRAM.limits.degree_max)
      .trim();
    return required ? schema.required() : schema;
  }

  static _programType(required = true) {
    const schema = Joi.array()
      .items(Joi.string().valid(...PROGRAM.filters.program_type_options))
      .min(1)
      .max(5);
    return required ? schema.required() : schema;
  }

  static _facultyName(required = true) {
    const schema = Joi.string()
      .min(PROGRAM.limits.faculty_min)
      .max(PROGRAM.limits.faculty_max)
      .trim();
    return required ? schema.required() : schema;
  }

  static _departmentName(required = true) {
    const schema = Joi.string()
      .min(PROGRAM.limits.department_min)
      .max(PROGRAM.limits.department_max)
      .trim();
    return required ? schema.required() : schema;
  }

  static _creditRequired(required = true) {
    const schema = Joi.number().min(1).max(200);
    return required ? schema.required() : schema;
  }

  static _tuition(required = true) {
    const schema = Joi.number().min(0);
    return required ? schema.required() : schema;
  }

  static _description(required = true) {
    const schema = Joi.string()
      .min(PROGRAM.limits.description_min)
      .max(PROGRAM.limits.description_max);
    return required ? schema.required() : schema;
  }

  // Optional fields (always optional)
  static _years() {
    return Joi.number().min(0).max(10);
  }

  static _months() {
    return Joi.number().min(0).max(11);
  }

  static _semester() {
    return Joi.number().min(1).max(12);
  }

  static _weeklyCommitment() {
    return Joi.string().max(50).trim().allow("");
  }

  static _currency() {
    return Joi.string()
      .valid(...PROGRAM.filters.currency_options)
      .uppercase()
      .default("USD");
  }

  static _paymentSchedule() {
    return Joi.string()
      .valid(...PROGRAM.filters.payment_schedule_options)
      .default("semester");
  }

  static _intakeName() {
    return Joi.string().trim();
  }

  static _deadline() {
    return Joi.date();
  }

  static _sectionHeading() {
    return Joi.string().max(200).trim();
  }

  static _sectionDescription() {
    return Joi.string().min(10).max(2000);
  }

  static _tags() {
    return Joi.array().items(Joi.string().trim()).default([]);
  }

  static _objectId() {
    return Joi.string().allow("", null);
  }
}
