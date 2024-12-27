// src/routes/userRoutes.ts

import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController";
// import authMiddleware from "../middlewares/authMiddleware"; // 인증 미들웨어 제거

const router = Router();

console.log("User routes loaded"); // 라우트 로드 확인 로그

// 모든 사용자 조회 (인증 없이 접근 가능)
router.get("/", getAllUsers);

// 특정 사용자 조회 (인증 필요, 선택 사항)
router.get("/:id", getUserById); // 인증 미들웨어 제거 (필요 시 다시 추가 가능)

export default router;
