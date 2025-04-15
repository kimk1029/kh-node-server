import { Router } from "express";
import {
  createAnonymousPost,
  deleteAnonymousPost,
  getAllAnonymousPosts,
  getAnonymousPostById,
  toggleAnonymousLike,
  updateAnonymousPost,
} from "../controllers/anonymousPostController";
import {
  addAnonymousComment,
  getAnonymousCommentsByPost,
} from "../controllers/anonymousCommentController";
import { postLimiter, commentLimiter } from "../middleware/rateLimit";

const router = Router();

// 게시글 작성
router.post("/", createAnonymousPost);

// 게시글 목록 조회
router.get("/", getAllAnonymousPosts);

// 특정 게시글 조회
router.get("/:id", getAnonymousPostById);

// 게시글 수정
router.put("/:id", updateAnonymousPost);

// 게시글 삭제
router.delete("/:id", deleteAnonymousPost);

// 댓글 추가
router.post("/:id/comments", addAnonymousComment);

// 특정 게시글의 모든 댓글 조회
router.get("/:id/comments", getAnonymousCommentsByPost);

// 게시글 좋아요 토글
router.post("/:id/like", toggleAnonymousLike);

export default router; 