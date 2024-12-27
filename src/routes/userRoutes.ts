// src/routes/userRoutes.ts

import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

// 모든 사용자 조회 (인증 필요)
//router.get("/", authMiddleware, getAllUsers);
router.get("/", getAllUsers);
// 특정 사용자 조회 (인증 필요, 선택 사항)
router.get("/:id", authMiddleware, getUserById);

export default router;
