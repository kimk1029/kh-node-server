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
router.post("/:postId/comments", commentLimiter, addAnonymousComment);
router.get("/:id/comments", getAnonymousCommentsByPost);

export default router; 