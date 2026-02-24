import { ConversationMessage } from "../../schemas/consultant/message.js";
import { ConversationRoom } from "../../schemas/consultant/room.js";
import { ConversationMessageJoi } from "../../validation/consultant/message.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

export class StudentMessageController {
  // Student sends message or attachments to consultant
  async sendMessage(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);

      const { error, value } = ConversationMessageJoi.sendByStudent().validate(
        req.body,
        { allowUnknown: true },
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      // find or create a room for this student -> (consultant | admin)
      let roomId = value.room_id;
      if (!roomId) {
        let filter = { student: req.user.id };
        if (value.admin) {
          filter.admin = value.admin;
        } else {
          filter.consultant = value.consultant;
          filter.application = value.application || null;
        }

        let room = await MongoService.findOne(ConversationRoom, filter);
        if (!room) {
          const createPayload = { student: req.user.id };
          if (value.admin) createPayload.admin = value.admin;
          else {
            createPayload.consultant = value.consultant;
            if (value.application)
              createPayload.application = value.application;
          }
          room = await MongoService.create(ConversationRoom, createPayload);
        }
        roomId = room._id;
      }

      const payload = {
        room: roomId,
        student: req.user.id,
        consultant: value.admin ? undefined : value.consultant,
        admin: value.admin || undefined,
        application: value.application || undefined,
        sender_role: "student",
        sender_id: req.user.id,
        text: value.text || "",
        attachments: value.attachments || [],
      };

      const created = await MongoService.create(ConversationMessage, payload);

      // Update room's last message
      await MongoService.updateOne(
        ConversationRoom,
        { _id: roomId },
        {
          last_message: value.text || "",
          last_message_time: new Date(),
          updatedAt: new Date(),
        },
      );

      Response.success(res, "Message sent", { id: created._id, room: roomId });
    } catch (err) {
      console.error("Student Send Message Error:", err);
      Response.error(res, "Failed to send message", 500);
    }
  }

  // List messages between authenticated student and a consultant (or all)
  async listConversations(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const { consultant, application, room, page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      if (room) {
        // list messages in a room
        const msgs = await ConversationMessage.find({ room })
          .populate({
            path: "consultant",
            select: "name email",
            populate: { path: "profile", select: "avatar" },
          })
          .populate("application")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .exec();
        const total = await MongoService.count(ConversationMessage, { room });
        return Response.success(res, "Messages retrieved", {
          messages: msgs,
          pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
      }

      // otherwise list rooms for student (optionally filtered)
      const roomFilter = { student: req.user.id };
      if (consultant) roomFilter.consultant = consultant;
      if (application) roomFilter.application = application;
      const rooms = await ConversationRoom.find(roomFilter)
        .populate({
          path: "consultant",
          select: "name email",
          populate: { path: "profile", select: "avatar" },
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
      const totalRooms = await MongoService.count(ConversationRoom, roomFilter);
      Response.success(res, "Rooms retrieved", {
        rooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRooms,
        },
      });
    } catch (err) {
      console.error("List Conversations Error:", err);
      Response.error(res, "Failed to list messages", 500);
    }
  }

  // Get messages for a specific room
  async getRoomMessages(req, res) {
    try {
      if (!req.user?.id) return Response.error(res, "Unauthorized", 401);
      const room = req.params.id || req.query.room;
      if (!room) return Response.error(res, "Missing room id", 400);

      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // ensure student is part of the room
      const roomDoc = await ConversationRoom.findById(room).exec();
      if (!roomDoc) return Response.error(res, "Room not found", 404);
      if (roomDoc.student.toString() !== req.user.id.toString())
        return Response.error(res, "Forbidden", 403);

      const msgs = await ConversationMessage.find({ room })
        .populate({
          path: "consultant",
          select: "name email",
          populate: { path: "profile", select: "avatar" },
        })
        .populate("student", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
      const total = await MongoService.count(ConversationMessage, { room });

      const sanitized = msgs.map((m) => ({
        id: m._id,
        text: m.text,
        attachments: m.attachments,
        sender_role: m.sender_role,
        sender_id: m.sender_id,
        createdAt: m.createdAt,
        consultant: m.consultant,
        student: m.student,
      }));

      Response.success(res, "Messages retrieved", {
        messages: sanitized,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("Get Room Messages Error:", err);
      Response.error(res, "Failed to get room messages", 500);
    }
  }
}

export default StudentMessageController;
