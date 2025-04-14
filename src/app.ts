import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import anonymousRoutes from "./routes/anonymousRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/anonymous", anonymousRoutes);

export default app; 