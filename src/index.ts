import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import userRoutes from "./routes/userRoutes"; // 사용자 라우트 추가
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
createConnection({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/entities/*.js"],
  migrations: [__dirname + "/migrations/*.js"],
  cli: {
    migrationsDir: "src/migration",
  },
  synchronize: false, // 마이그레이션 사용을 위해 false로 설정// 개발 환경에서만 사용 (프로덕션에서는 마이그레이션 사용 권장)
  logging: false,
})
  .then(() => {
    console.log("Connected to the database");
    // Routes
    // 데이터베이스 연결이 성공한 후에 라우트를 등록하고 서버를 시작합니다.
    app.use("/api/auth", authRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/users", userRoutes); // 사용자 라우트 등록
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Database connection error:", error));
