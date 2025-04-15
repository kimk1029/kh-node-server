import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import anonymousRoutes from "./routes/anonymousRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 데이터베이스 연결
createConnection()
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((error) => {
    console.error("데이터베이스 연결 실패:", error);
  });

// 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/anonymous", anonymousRoutes);

export default app; 