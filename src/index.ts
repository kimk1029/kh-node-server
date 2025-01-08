import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import userRoutes from "./routes/userRoutes";

const connectionOptions = require("./typeorm.config"); // CommonJS 방식으로 임포트
dotenv.config();

const app = express();
const PORT = process.env.PORT || 50000;

// Middleware
app.use(cors());
app.use(express.json());

// 저장할 현재 접속자 목록
const connectedUsers: { [socketId: string]: string } = {};

createConnection(connectionOptions)
  .then(() => {
    console.log("Connected to the database");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/users", userRoutes);

    // HTTP and WebSocket Server
    const server = http.createServer(app);
    const io = new SocketIO(server, {
      cors: { origin: "*" },
    });

    // Socket.IO 인증 미들웨어
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        socket.data.user = user;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    // WebSocket 이벤트 처리
    io.on("connection", (socket) => {
      const username = socket.data.user.username;
      connectedUsers[socket.id] = username;
      console.log("User connected:", username);

      // 접속자 목록 업데이트
      io.emit("update users", Object.values(connectedUsers));

      socket.on("chat message", (msg) => {
        io.emit("chat message", { username, msg });
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", username);
        delete connectedUsers[socket.id];
        // 접속자 목록 업데이트
        io.emit("update users", Object.values(connectedUsers));
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Database connection error:", error));
