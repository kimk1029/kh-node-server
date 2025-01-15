import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  toggleLike,
  updatePost,
} from "../controllers/postController";
import authMiddleware from "../middlewares/authMiddleware";
import {
  addComment,
  getCommentsByPost,
} from "../controllers/commentController";

const router = Router();

// 게시글 작성 (인증 필요)
router.post("/", authMiddleware, createPost);

// 게시글 목록 조회
router.get("/", getAllPosts);

// 특정 게시글 조회
router.get("/:id", authMiddleware, getPostById);

// 게시글 수정 (인증 필요)
router.put("/:id", authMiddleware, updatePost);

// 게시글 삭제 (인증 필요)
router.delete("/:id", authMiddleware, deletePost);

// 댓글 추가 (인증 필요)
router.post("/:id/comments", authMiddleware, addComment);

// 특정 게시글의 모든 댓글 조회
router.get("/:id/comments", getCommentsByPost);

// 게시글 좋아요 토글
router.post("/:id/like", authMiddleware, toggleLike);
export default router;
