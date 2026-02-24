import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
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
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    last_message: { type: String, default: null },
    last_message_time: { type: Date, default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

roomSchema.index({ student: 1, consultant: 1, application: 1 });
roomSchema.index({ admin: 1, student: 1 });
roomSchema.index({ admin: 1, consultant: 1 });

// Ensure a room has at least two participants (student, consultant, admin)
roomSchema.pre("validate", function () {
  const parts = [this.student, this.consultant, this.admin].filter((p) => !!p);
  if (parts.length < 2) {
    throw new Error("Room must include at least two participants");
  }
});

export const ConversationRoom = mongoose.model("ConversationRoom", roomSchema);
