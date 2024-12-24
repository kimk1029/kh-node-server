import { Router } from "express";
import { register, login } from "../controllers/authController";

const router = Router();

// 회원가입
router.post("/register", register);

// 로그인
router.post("/login", login);

export default router;
