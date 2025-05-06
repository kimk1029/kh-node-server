import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  toggleLike,
  updatePost,
} from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";
import {
  addComment,
  getCommentsByPost,
} from "../controllers/commentController";

const router = Router();
console.log("[[[[[[[[[[[[[[postRoutes]]]]]]]]]]]]]]");
// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 이미지 형식입니다.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// 게시글 작성 (인증 필요, 이미지 업로드 포함)
router.post(
  '/',
  authMiddleware,
  (req, res, next) => (upload.single('image') as any)(req, res, (err: Error) => {
    if (err) return next(err);
    next();
  }),
  createPost
);

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
