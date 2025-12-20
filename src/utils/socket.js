const socketIO = require("socket.io");
const crypto = require("crypto");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { Chat } = require("../model/chat");

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

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Unauthorized"));
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, "DEV@Tinder$790");

      socket.userId = decoded._id;
      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Authenticated socket:", socket.userId);

    socket.on("joinChat", ({ targetUserId }) => {
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      console.log(socket);
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      try {
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
        });
        await chat.save();
      } catch (error) {
        console.log(error);
      }
      io.to(roomId).emit("messageRecieved", {
        senderId: socket.userId,
        text,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = initialiseSocket;
