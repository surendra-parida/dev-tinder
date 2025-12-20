const socketIO = require("socket.io");
const crypto = require("crypto");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

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

    socket.on("sendMessage", ({ targetUserId, text }) => {
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      io.to(roomId).emit("messageRecieved", {
        firstName: socket.user.firstName,
        text,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = initialiseSocket;
