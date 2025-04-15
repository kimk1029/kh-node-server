import express from "express";
import {
  createAnonymousPost,
  getAllAnonymousPosts,
  getAnonymousPostById,
  updateAnonymousPost,
  deleteAnonymousPost,
  toggleAnonymousLike,
} from "../controllers/anonymousPostController";
import {
  createAnonymousComment,
  updateAnonymousComment,
  deleteAnonymousComment,
} from "../controllers/anonymousCommentController";
import { postLimiter, commentLimiter } from "../middleware/rateLimit";

const router = express.Router();

// GET 요청 테스트 응답
router.get("/", (req, res) => {
  res.json({ message: "hello" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `hello ${req.params.id}` });
});

// POST, PUT, DELETE 요청 라우트
router.post("/", postLimiter, createAnonymousPost);
router.put("/:id", updateAnonymousPost);
router.delete("/:id", deleteAnonymousPost);
router.post("/:id/like", toggleAnonymousLike);

// 댓글 관련 라우트
router.post("/:postId/comments", commentLimiter, createAnonymousComment);
router.put("/comments/:id", updateAnonymousComment);
router.delete("/comments/:id", deleteAnonymousComment);

export default router; 