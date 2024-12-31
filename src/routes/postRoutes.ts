import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
} from "../controllers/postController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

// 게시글 작성 (인증 필요)
router.post("/", authMiddleware, createPost);

// 게시글 목록 조회
router.get("/", getAllPosts);

// 특정 게시글 조회
router.get("/:id", getPostById);

// 게시글 수정 (인증 필요)
router.put("/:id", authMiddleware, updatePost);

// 게시글 삭제 (인증 필요)
router.delete("/:id", authMiddleware, deletePost);
export default router;
