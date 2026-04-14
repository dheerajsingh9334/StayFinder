import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import prisma from "../utils/dbconnect";
import { emailQueue } from "../queue/email.queue";

export let io: Server;

export function initSocket(server: HttpServer, frontendUrl: string) {
  io = new Server(server, {
    cors: {
      origin: frontendUrl,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth.token || socket.handshake.query?.token as string;
      
      // If no explicit token provided, try to extract from cookies
      if (!token && socket.request.headers.cookie) {
        const cookies = socket.request.headers.cookie.split(";").reduce((acc, current) => {
          const [name, ...value] = current.trim().split("=");
          acc[name] = value.join("=");
          return acc;
        }, {} as Record<string, string>);
        token = cookies["accessToken"];
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }
      
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret") as any;
      socket.data.userId = payload.userId;
      next();
    } catch (e) {
      console.warn("Socket auth failed:", e);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    onlineUsers.set(userId, socket.id);

    // Broadcast user online status
    io.emit("user_status", { userId, status: "online" });

    socket.on("send_message", async (data) => {
      try {
        // 1. Persist message to DB
        const saved = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            Sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
        });

        // 2. Deliver in real-time if receiver is online
        const receiverSocketId = onlineUsers.get(data.receiverId);
        const payload = {
          id: saved.id,
          senderId: userId,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: saved.createdAt,
        };
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message", payload);
        }
        // Echo back to sender so optimistic UI stays in sync
        socket.emit("new_message", payload);

        // 3. Queue email notification for receiver (event-driven via BullMQ)
        await emailQueue.add("new-message-email", {
          receiverEmail: saved.receiver.email,
          receiverName: saved.receiver.name,
          senderName: saved.Sender.name,
          preview: data.content.slice(0, 120),
        }, {
          attempts: 3,
          backoff: { type: "exponential", delay: 3000 },
        });
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    socket.on("typing", (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId, isTyping: data.isTyping });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user_status", { userId, status: "offline" });
    });
  });
}
