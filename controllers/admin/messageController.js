import { ConversationMessage } from "../../schemas/consultant/message.js";
import { ConversationRoom } from "../../schemas/consultant/room.js";
import { Profile as StudentProfile } from "../../schemas/student/profile.js";
import { Profile as ConsultantProfile } from "../../schemas/consultant/profile.js";
import { ConversationMessageJoi } from "../../validation/consultant/message.js";
import { Response } from "../../utils/Response.js";
import { MongoService } from "../../services/MongoService.js";

const isAdminUser = (user) => {
  if (!user) return false;
  const role = user.role || user?.role;
  return role === "admin" || role === "Admin";
};

export class AdminMessageController {
  // Admin sends message to student or consultant
  async sendMessage(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);

      const { error, value } = ConversationMessageJoi.sendByAdmin().validate(
        req.body,
        {
          allowUnknown: true,
        }
      );
      if (error) return Response.error(res, error.details[0].message, 400);

      let roomId = value.room_id;
      if (!roomId) {
        let filter = {};
        if (value.student) filter.student = value.student;
        if (value.consultant) filter.consultant = value.consultant;
        filter.admin = req.user.id;

        let room = await MongoService.findOne(ConversationRoom, filter);
        if (!room) {
          const createPayload = { admin: req.user.id };
          if (value.student) createPayload.student = value.student;
          if (value.consultant) createPayload.consultant = value.consultant;
          const createdRoom = await MongoService.create(
            ConversationRoom,
            createPayload
          );
          roomId = createdRoom._id;
        } else {
          roomId = room._id;
        }
      }

      const payload = {
        room: roomId,
        student: value.student,
        consultant: value.consultant,
        admin: req.user.id,
        sender_role: "admin",
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
        }
      );

      Response.success(res, "Message sent", { id: created._id, room: roomId });
    } catch (err) {
      console.error("Admin Send Message Error:", err);
      Response.error(res, "Failed to send message", 500);
    }
  }

  // list rooms for admin or messages in a specific room
  async listConversations(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);
      const { student, consultant, page = 1, limit = 50 } = req.query;
      const room = req.query.room || req.params.id || req.body?.room_id;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      if (room) {
        const msgs = await ConversationMessage.find({ room })
          .populate("student", "name email")
          .populate("consultant", "name email")
          .populate("admin", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .exec();
        const total = await MongoService.count(ConversationMessage, { room });

        // Get unique user IDs for profiles
        const userIds = [
          ...new Set([
            ...msgs.map((m) => m.student?._id).filter((id) => id),
            ...msgs.map((m) => m.consultant?._id).filter((id) => id),
            ...msgs.map((m) => m.admin?._id).filter((id) => id),
          ]),
        ];

        const studentProfiles = await StudentProfile.find({
          user: { $in: userIds },
        });
        const consultantProfiles = await ConsultantProfile.find({
          user: { $in: userIds },
        });
        const profileMap = new Map();
        studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
        consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

        const sanitized = msgs.map((m) => ({
          id: m._id,
          content: m.text,
          attachments: m.attachments,
          sender_type: m.sender_role,
          sender_id: m.sender_id,
          createdAt: m.createdAt,
          student: m.student
            ? {
                id: m.student._id,
                name: m.student.name,
                email: m.student.email,
                avatar:
                  profileMap.get(m.student._id.toString())?.avatar || null,
              }
            : null,
          consultant: m.consultant
            ? {
                id: m.consultant._id,
                name: m.consultant.name,
                email: m.consultant.email,
                avatar:
                  profileMap.get(m.consultant._id.toString())?.avatar || null,
              }
            : null,
          admin: m.admin
            ? {
                id: m.admin._id,
                name: m.admin.name,
                email: m.admin.email,
                avatar: null, // Admin might not have profile
              }
            : null,
        }));
        return Response.success(res, "Messages retrieved", {
          messages: sanitized,
          pagination: { page: parseInt(page), limit: parseInt(limit), total },
        });
      }

      const roomFilter = { admin: req.user.id };
      if (student) roomFilter.student = student;
      if (consultant) roomFilter.consultant = consultant;

      const rooms = await ConversationRoom.find(roomFilter)
        .populate("student", "name email")
        .populate("consultant", "name email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

      const totalRooms = await MongoService.count(ConversationRoom, roomFilter);

      // Get unique user IDs for profiles
      const userIds = [
        ...new Set([
          ...rooms.map((r) => r.student?._id).filter((id) => id),
          ...rooms.map((r) => r.consultant?._id).filter((id) => id),
        ]),
      ];
      console.log(userIds);
      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      console.log(studentProfiles);
      console.log(consultantProfiles);
      console.log(profileMap);
      const roomsWithAvatars = rooms.map((r) => ({
        id: r._id,
        student: r.student
          ? {
              id: r.student._id,
              name: r.student.name,
              email: r.student.email,
              avatar: profileMap.get(r.student._id.toString())?.avatar || null,
            }
          : null,
        consultant: r.consultant
          ? {
              id: r.consultant._id,
              name: r.consultant.name,
              email: r.consultant.email,
              avatar:
                profileMap.get(r.consultant._id.toString())?.avatar || null,
            }
          : null,
        last_message: r.last_message || null,
        last_message_time: r.last_message_time || r.updatedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      Response.success(res, "Rooms retrieved", {
        conversations: roomsWithAvatars,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRooms,
        },
      });
    } catch (err) {
      console.error("Admin List Conversations Error:", err);
      Response.error(res, "Failed to list messages", 500);
    }
  }

  // get messages for a specific room
  async getRoomMessages(req, res) {
    try {
      if (!isAdminUser(req.user)) return Response.error(res, "Forbidden", 403);
      const room = req.params.id || req.query.room;
      if (!room) return Response.error(res, "Missing room id", 400);

      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const roomDoc = await ConversationRoom.findById(room).exec();
      if (!roomDoc) return Response.error(res, "Room not found", 404);
      if (roomDoc.admin?.toString() !== req.user.id.toString())
        return Response.error(res, "Forbidden", 403);

      const msgs = await ConversationMessage.find({ room })
        .populate("student", "name email")
        .populate("consultant", "name email")
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();
      const total = await MongoService.count(ConversationMessage, { room });

      // Get unique user IDs for profiles
      const userIds = [
        ...new Set([
          ...msgs.map((m) => m.student?._id).filter((id) => id),
          ...msgs.map((m) => m.consultant?._id).filter((id) => id),
          ...msgs.map((m) => m.admin?._id).filter((id) => id),
        ]),
      ];

      const studentProfiles = await StudentProfile.find({
        user: { $in: userIds },
      });
      const consultantProfiles = await ConsultantProfile.find({
        user: { $in: userIds },
      });
      const profileMap = new Map();
      studentProfiles.forEach((p) => profileMap.set(p.user.toString(), p));
      consultantProfiles.forEach((p) => profileMap.set(p.user.toString(), p));

      const sanitized = msgs.map((m) => ({
        id: m._id,
        content: m.text,
        attachments: m.attachments,
        sender_type: m.sender_role,
        sender_id: m.sender_id,
        createdAt: m.createdAt,
        student: m.student
          ? {
              id: m.student._id,
              name: m.student.name,
              email: m.student.email,
              avatar: profileMap.get(m.student._id.toString())?.avatar || null,
            }
          : null,
        consultant: m.consultant
          ? {
              id: m.consultant._id,
              name: m.consultant.name,
              email: m.consultant.email,
              avatar:
                profileMap.get(m.consultant._id.toString())?.avatar || null,
            }
          : null,
        admin: m.admin
          ? {
              id: m.admin._id,
              name: m.admin.name,
              email: m.admin.email,
              avatar: null,
            }
          : null,
      }));

      Response.success(res, "Messages retrieved", {
        messages: sanitized,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (err) {
      console.error("Admin Get Room Messages Error:", err);
      Response.error(res, "Failed to get room messages", 500);
    }
  }
}

export default AdminMessageController;
