const socket = require("socket.io");

const initialiseSocket = (server) => {
  const io = socket(server, { origin: "http://localhost:5173" });

  io.on("connection", (socket) => {
    socket.on("joinChat", () => {});
    socket.on("sendMessage", () => {});
    socket.on("disconnect", () => {});
  });
};
module.exports = initialiseSocket;
