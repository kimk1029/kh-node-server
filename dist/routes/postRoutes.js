"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// 게시글 작성 (인증 필요)
router.post("/", authMiddleware_1.default, postController_1.createPost);
// 게시글 목록 조회
router.get("/", postController_1.getAllPosts);
// 특정 게시글 조회
router.get("/:id", postController_1.getPostById);
exports.default = router;
