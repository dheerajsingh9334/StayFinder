import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

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
      const token = socket.handshake.auth.token || socket.handshake.query?.token as string;
      // We will allow users to connect without token for now, or just throw error
      if (!token) return next(new Error("Authentication error"));
      
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret") as any;
      socket.data.userId = payload.userId;
      next();
    } catch (e) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    onlineUsers.set(userId, socket.id);

    // Broadcast user online status
    io.emit("user_status", { userId, status: "online" });

    socket.on("send_message", (data) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", {
          ...data,
          senderId: userId,
          timestamp: new Date()
        });
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
