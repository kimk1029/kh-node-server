// src/routes/userRoutes.ts

import { Router } from "express";
import {
  getAllUsers,
  getMyAccount,
  getUserById,
  updateMyAccount,
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
// import authMiddleware from "../middlewares/authMiddleware"; // 인증 미들웨어 제거

const router = Router();

console.log("User routes loaded"); // 라우트 로드 확인 로그

// 모든 사용자 조회 (인증 없이 접근 가능)
router.get("/", getAllUsers);

// 특정 사용자 조회 (인증 필요, 선택 사항)
router.get("/:id", getUserById); // 인증 미들웨어 제거 (필요 시 다시 추가 가능)
// 신규: 내 계정 관련
// GET /api/users/account -> 내 계정 정보, posts, comments
router.get("/account/:id", authMiddleware, getMyAccount);

// PATCH /api/users/account -> 내 계정 수정
router.patch("/account/:id", authMiddleware, updateMyAccount);
export default router;
