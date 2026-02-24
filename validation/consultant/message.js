import Joi from "joi";

export class ConversationMessageJoi {
  static sendByStudent() {
    return Joi.object({
      consultant: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      admin: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      room_id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      application: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .allow(""),
      text: Joi.string().allow("").optional(),
      attachments: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            public_id: Joi.string().required(),
          }),
        )
        .optional()
        .default([]),
    })
      .or("text", "attachments")
      .or("consultant", "admin", "room_id");
  }

  static sendByConsultant() {
    return Joi.object({
      student: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      admin: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      room_id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      application: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .allow(""),
      text: Joi.string().allow("").optional(),
      attachments: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            public_id: Joi.string().required(),
          }),
        )
        .optional()
        .default([]),
    })
      .or("text", "attachments")
      .or("student", "admin", "room_id");
  }

  static sendByAdmin() {
    return Joi.object({
      student: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      consultant: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      room_id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional(),
      text: Joi.string().allow("").optional(),
      attachments: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            public_id: Joi.string().required(),
          }),
        )
        .optional()
        .default([]),
    })
      .or("text", "attachments")
      .or("student", "consultant", "room_id");
  }
}
