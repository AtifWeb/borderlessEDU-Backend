import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: false,
    },
    consultant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultant",
      required: false,
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    sender_role: {
      type: String,
      enum: ["student", "consultant", "admin"],
      required: true,
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "ConversationRoom" },
    sender_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, default: "" },
    attachments: {
      type: [
        {
          name: String,
          url: String,
          public_id: String,
        },
      ],
      default: [],
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ student: 1, consultant: 1 });
messageSchema.index({ admin: 1, student: 1 });
messageSchema.index({ admin: 1, consultant: 1 });

export const ConversationMessage = mongoose.model(
  "ConversationMessage",
  messageSchema,
);
