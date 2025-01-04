import { Router } from "express";
import {
  register,
  login,
  checkEmail,
  checkUsername,
} from "../controllers/authController";

const router = Router();

// 회원가입
router.post("/register", register);

// 로그인
router.post("/login", login);
// 사용자 존재 여부 확인 엔드포인트
router.post("/check-email", checkEmail);
router.post("/check-username", checkUsername);
export default router;
