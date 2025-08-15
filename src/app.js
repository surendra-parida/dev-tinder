const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const initialiseSocket = require("./utils/socket");

const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

const server = http.createServer(app);
initialiseSocket(server);
connectDB()
  .then(() => {
    console.log("Connection established successfully");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
