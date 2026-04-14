import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";

export default class MessageController {
  static getHistory = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const { otherUserId } = req.params;
      const userId = req.user.userId;

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: "asc" }
      });

      return res.status(200).json({ messages });
    } catch (error) {
      console.error("Message getHistory error", error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static getConversations = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
      const userId = req.user.userId;

      // Find all distinct users we have chatted with
      const messages = await prisma.message.findMany({
        where: {
          OR: [
             { senderId: userId },
             { receiverId: userId }
          ]
        },
        orderBy: { createdAt: "desc" },
        include: {
          Sender: { select: { id: true, name: true, avatarUrl: true } },
          receiver: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      const conversationsMap = new Map();
      messages.forEach(msg => {
        const isSender = msg.senderId === userId;
        const otherUser = isSender ? msg.receiver : msg.Sender;
        if (!conversationsMap.has(otherUser.id)) {
          conversationsMap.set(otherUser.id, {
            user: otherUser,
            lastMessage: msg.content,
            timestamp: msg.createdAt
          });
        }
      });

      const conversations = Array.from(conversationsMap.values());

      // Attempt to find a related property based on bookings between the two users
      for (const conv of conversations) {
        const otherUser = conv.user;
        const booking = await prisma.booking.findFirst({
          where: {
             OR: [
               { userId: userId, property: { ownerId: otherUser.id } },
               { userId: otherUser.id, property: { ownerId: userId } }
             ]
          },
          include: { property: { select: { id: true, title: true, images: true } } },
          orderBy: { createdAt: "desc" }
        });

        if (booking) {
          conv.property = booking.property;
        }
      }

      return res.status(200).json({ conversations });
    } catch (error) {
       console.error("Message getConversations error", error);
       return res.status(500).json({ msg: "Server Error" });
    }
  };
}
