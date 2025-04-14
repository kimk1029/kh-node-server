import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
} from "../controllers/anonymousPostController";
import {
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/anonymousCommentController";
import rateLimit from "express-rate-limit";

const router = express.Router();

// 요청 제한 설정
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10, // IP당 최대 10회 요청
  message: "너무 많은 요청을 보냈습니다. 1시간 후에 다시 시도해주세요.",
});

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 30, // IP당 최대 30회 요청
  message: "너무 많은 요청을 보냈습니다. 1시간 후에 다시 시도해주세요.",
});

// 게시글 라우트
router.post("/posts", postLimiter, createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", postLimiter, updatePost);
router.delete("/posts/:id", postLimiter, deletePost);
router.post("/posts/:id/like", toggleLike);

// 댓글 라우트
router.post("/posts/:postId/comments", commentLimiter, createComment);
router.put("/comments/:id", commentLimiter, updateComment);
router.delete("/comments/:id", commentLimiter, deleteComment);

export default router; 