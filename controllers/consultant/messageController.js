import { ConversationMessage } from "../../schemas/consultant/message.js";
import { ConversationRoom } from "../../schemas/consultant/room.js";
import { ConversationMessageJoi } from "../../validation/consultant/message.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";
import { Profile as StudentProfile } from "../../schemas/student/profile.js";
import { Profile as ConsultantProfile } from "../../schemas/consultant/profile.js";
import { Profile as AdminProfile } from "../../schemas/admin/profile.js";

const isConsultantUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "consultant" || role === "Consultant";
};

export class ConsultantMessageController {
  // Consultant sends message or attachments to student
  async sendMessage(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);

      const { error, value } =
        ConversationMessageJoi.sendByConsultant().validate(req.body, {
          allowUnknown: true,
        });
      if (error) return Response.error(res, error.details[0].message, 400);

      // find or create room for consultant -> (student | admin)
      let roomId = value.room_id;
      if (!roomId) {
        let filter = { consultant: req.user.id };
        if (value.admin) {
          filter.admin = value.admin;
        } else {
          filter.student = value.student;
          filter.application = value.application || null;
        }

        let room = await MongoService.findOne(ConversationRoom, filter);
        if (!room) {
          const createPayload = { consultant: req.user.id };
          if (value.admin) createPayload.admin = value.admin;
          else {
            createPayload.student = value.student;
            if (value.application)
              createPayload.application = value.application;
          }
          room = await MongoService.create(ConversationRoom, createPayload);
        }
        roomId = room._id;
      }

      const payload = {
        room: roomId,
        student: value.admin ? undefined : value.student,
        consultant: req.user.id,
        admin: value.admin || undefined,
        application: value.application || undefined,
        sender_role: "consultant",
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
      console.error("Consultant Send Message Error:", err);
      Response.error(res, "Failed to send message", 500);
    }
  }

  // List messages for consultant with a student (or all)
  async listConversations(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);
      const { student, application, page = 1, limit = 50 } = req.query;
      const room = req.query.room || req.params.id || req.body?.room_id;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      if (room) {
        const msgs = await ConversationMessage.find({ room })
          .populate("student", "name email")
          .populate("consultant", "name email")
          .populate("application")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .exec();
        const total = await MongoService.count(ConversationMessage, { room });

        // Get unique user IDs for profiles
        const userIds = [
          ...new Set([
            ...msgs.map((m) => m.student?._id).filter((id) => id),
            ...msgs.map((m) => m.consultant).filter((id) => id),
          ]),
        ];

        const studentProfiles = await StudentProfile.find({
          user: { $in: userIds },
        });
        const consultantProfiles = await ConsultantProfile.find({
          user: { $in: userIds },
        });
        const adminProfiles = await AdminProfile.find({
          user: { $in: userIds },
        });
        const profileMap = new Map();
        studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
        consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
        adminProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

        const messagesWithProfiles = msgs.map((m) => ({
          ...m.toObject(),
          student: m.student
            ? {
                ...m.student.toObject(),
                avatar:
                  profileMap.get(m.student._id.toString())?.avatar || null,
              }
            : null,
          consultant: m.consultant
            ? {
                ...m.consultant.toObject(),
                avatar:
                  profileMap.get(m.consultant._id.toString())?.avatar || null,
              }
            : null,
        }));

        return Response.success(res, "Messages retrieved", {
          messages: messagesWithProfiles,
          pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
      }

      // otherwise list rooms for consultant
      const roomFilter = { consultant: req.user.id };
      if (student) roomFilter.student = student;
      if (application) roomFilter.application = application;

      const rooms = await ConversationRoom.find(roomFilter)
        .populate("student", "name email")
        .populate("admin", "name email")
        .populate("application")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      const totalRooms = await MongoService.count(ConversationRoom, roomFilter);

      // Get unique user IDs for profiles
      const userIds = [
        ...new Set([
          ...rooms.map((r) => r.student?._id).filter((id) => id),
          ...rooms.map((r) => r.admin?._id).filter((id) => id),
          ...rooms.map((r) => r.consultant).filter((id) => id),
        ]),
      ];

      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const adminProfiles = await AdminProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      adminProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const roomsWithProfiles = rooms.map((room) => ({
        ...room.toObject(),
        student: room.student
          ? {
              ...room.student.toObject(),
              avatar:
                profileMap.get(room.student._id.toString())?.avatar || null,
            }
          : null,
        admin: room.admin
          ? {
              ...room.admin.toObject(),
              avatar: profileMap.get(room.admin._id.toString())?.avatar || null,
            }
          : null,
        consultant: room.consultant
          ? {
              id: room.consultant,
              avatar:
                profileMap.get(room.consultant.toString())?.avatar || null,
            }
          : null,
      }));

      Response.success(res, "Rooms retrieved", {
        rooms: roomsWithProfiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRooms,
        },
      });
    } catch (err) {
      console.error("Consultant List Conversations Error:", err);
      Response.error(res, "Failed to list messages", 500);
    }
  }

  // Get messages for a specific room
  async getRoomMessages(req, res) {
    try {
      if (!isConsultantUser(req.user))
        return Response.error(res, "Forbidden", 403);
      const room = req.params.id || req.query.room;
      if (!room) return Response.error(res, "Missing room id", 400);

      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // ensure consultant is part of the room
      const roomDoc = await ConversationRoom.findById(room).exec();
      if (!roomDoc) return Response.error(res, "Room not found", 404);
      if (roomDoc.consultant.toString() !== req.user.id.toString())
        return Response.error(res, "Forbidden", 403);

      const msgs = await ConversationMessage.find({ room })
        .populate("student", "name email")
        .populate("consultant", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
      const total = await MongoService.count(ConversationMessage, { room });

      // Get unique user IDs for profiles
      const userIds = [
        ...new Set([
          ...msgs.map((m) => m.student?._id).filter((id) => id),
          ...msgs.map((m) => m.consultant).filter((id) => id),
        ]),
      ];

      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const adminProfiles = await AdminProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      adminProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const sanitized = msgs.map((m) => ({
        id: m._id,
        text: m.text,
        attachments: m.attachments,
        sender_role: m.sender_role,
        sender_id: m.sender_id,
        createdAt: m.createdAt,
        student: m.student
          ? {
              ...m.student.toObject(),
              avatar: profileMap.get(m.student._id.toString())?.avatar || null,
            }
          : null,
        consultant: m.consultant
          ? {
              ...m.consultant.toObject(),
              avatar:
                profileMap.get(m.consultant._id.toString())?.avatar || null,
            }
          : null,
      }));

      Response.success(res, "Messages retrieved", {
        messages: sanitized,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("Consultant Get Room Messages Error:", err);
      Response.error(res, "Failed to get room messages", 500);
    }
  }
}

export default ConsultantMessageController;
