"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostById = exports.getAllPosts = exports.createPost = void 0;
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
// 게시글 작성 컨트롤러
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postRepository = (0, typeorm_1.getRepository)(Post_1.Post);
    const { title, content } = req.body;
    if (!title || !content) {
        res.status(400).json({ message: "Please provide title and content" });
        return;
    }
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const post = postRepository.create({
            title,
            content,
            author: req.user,
        });
        yield postRepository.save(post);
        res.status(201).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createPost = createPost;
// 모든 게시글 조회 컨트롤러
const getAllPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postRepository = (0, typeorm_1.getRepository)(Post_1.Post);
    try {
        const posts = yield postRepository.find({
            relations: ["author"],
            order: { created_at: "DESC" },
        });
        res.status(200).json(posts);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllPosts = getAllPosts;
// 특정 게시글 조회 컨트롤러
const getPostById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postRepository = (0, typeorm_1.getRepository)(Post_1.Post);
    const { id } = req.params;
    try {
        const post = yield postRepository.findOne({
            where: { id: Number(id) },
            relations: ["author"],
        });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json(post);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getPostById = getPostById;
