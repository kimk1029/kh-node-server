import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  toggleLike,
  updatePost,
  searchPosts,
} from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";
import {
  addComment,
  getCommentsByPost,
} from "../controllers/commentController";

const router = Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `image-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("지원하지 않는 이미지 형식입니다."));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /posts
// 1. authMiddleware → 인증
// 2. upload.single('image') → 단일 파일 처리 (req.file에 저장)
// 3. createPost → 실제 컨트롤러
router.post(
  "/",
  authMiddleware,
  upload.single("image") as any,
  (req, res, next) => {
    console.log('✅ Multer 통과, req.file =', req.file);
    next();
  },
  async (req, res, next) => {
    console.log('▶ createPost 실행 직전');
    try {
      await createPost(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", getAllPosts);
router.get("/search", searchPosts);
router.get("/:id", authMiddleware, getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

router.post("/:id/comments", authMiddleware, addComment);
router.get("/:id/comments", getCommentsByPost);
router.post("/:id/like", authMiddleware, toggleLike);

export default router;