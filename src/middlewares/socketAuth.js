const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const socketAuthMiddleware = (socket, next) => {
  try {
    const cookies = cookie.parse(socket.request.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, "DEV@Tinder$790");
    socket.userId = decoded._id.toString();

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

module.exports = socketAuthMiddleware;
