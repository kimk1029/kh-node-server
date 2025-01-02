import { Router } from "express";
import { register, login, checkUser } from "../controllers/authController";

const router = Router();

// 회원가입
router.post("/register", register);

// 로그인
router.post("/login", login);
// 사용자 존재 여부 확인 엔드포인트
router.post("/check-user", checkUser);
export default router;
