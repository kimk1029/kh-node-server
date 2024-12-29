// src/typeorm.config.ts

import { ConnectionOptions } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User"; // User 엔티티가 있다면 추가

const connectionOptions: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Post, User], // 엔티티 추가
  migrations: ["src/migrations/**/*.ts"], // 마이그레이션 파일 경로
  cli: {
    migrationsDir: "src/migrations",
  },
  synchronize: false, // 마이그레이션 사용을 위해 false로 설정
  logging: false,
};

module.exports = connectionOptions; // CommonJS 방식으로 내보내기
