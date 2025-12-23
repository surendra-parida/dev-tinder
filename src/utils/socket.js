const socketIO = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../model/chat");
const socketAuthMiddleware = require("../middlewares/socketAuth");

const onlineUsers = new Map();

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initialiseSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    onlineUsers.set(socket.userId, socket.id);

    socket.emit("onlineUsers", Array.from(onlineUsers.keys()));

    socket.broadcast.emit("userStatus", {
      userId: socket.userId,
      isOnline: true,
    });

    socket.on("joinChat", async ({ targetUserId }) => {
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      socket.join(roomId);

      await Chat.updateOne(
        { participants: { $all: [socket.userId, targetUserId] } },
        { $set: { "messages.$[elem].seen": true } },
        { arrayFilters: [{ "elem.senderId": targetUserId }] }
      );

      io.to(roomId).emit("messageSeen", {
        seenBy: socket.userId,
      });
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      const isTargetOnline = onlineUsers.has(targetUserId);

      let chat = await Chat.findOne({
        participants: { $all: [socket.userId, targetUserId] },
      });

      if (!chat) {
        chat = new Chat({
          participants: [socket.userId, targetUserId],
          messages: [],
        });
      }

      chat.messages.push({
        senderId: socket.userId,
        text,
        seen: isTargetOnline,
      });

      await chat.save();

      io.to(roomId).emit("messageRecieved", {
        senderId: socket.userId,
        text,
        createdAt: new Date(),
        seen: isTargetOnline,
      });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);

      socket.broadcast.emit("userStatus", {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });
  });
};

module.exports = initialiseSocket;
