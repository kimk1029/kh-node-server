import {Router} from "express";
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

const router = Router();

// 게시글 관련 라우트
router.post("/", postLimiter, createAnonymousPost);
router.get("/", getAllAnonymousPosts);
router.get("/:id", getAnonymousPostById);
router.put("/:id", updateAnonymousPost);
router.delete("/:id", deleteAnonymousPost);
router.post("/:id/like", toggleAnonymousLike);

// 댓글 관련 라우트
router.post("/:postId/comments", commentLimiter, createAnonymousComment);
router.put("/comments/:id", updateAnonymousComment);
router.delete("/comments/:id", deleteAnonymousComment);

export default router; 