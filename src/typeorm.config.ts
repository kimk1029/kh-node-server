// src/typeorm.config.ts

import { ConnectionOptions } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User"; // User 엔티티가 있다면 추가
import dotenv from "dotenv";

// .env 파일 로드
dotenv.config();
const connectionOptions: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/entities/*.ts"],
  migrations: [__dirname + "/migrations/*.ts"],
  cli: {
    migrationsDir: "src/migrations",
  },
  synchronize: false, // 마이그레이션 사용을 위해 false로 설정
  logging: false,
};

module.exports = connectionOptions; // CommonJS 방식으로 내보내기

// createConnection({
//     type: "mysql",
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT) || 3306,
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     entities: [__dirname + "/entities/*.js"],
//     migrations: [__dirname + "/migrations/*.js"],
//     cli: {
//       migrationsDir: "src/migration",
//     },
//     synchronize: false, // 마이그레이션 사용을 위해 false로 설정// 개발 환경에서만 사용 (프로덕션에서는 마이그레이션 사용 권장)
//     logging: false,
//   })
