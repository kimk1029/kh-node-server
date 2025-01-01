// src/controllers/commentController.ts

import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Post } from "../entities/FreeBoard_Post";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Comment } from "../entities/FreeBoard_Comments";

// 댓글 추가 컨트롤러
const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentRepository = getRepository(Comment);
  const postRepository = getRepository(Post);
  const { id } = req.params; // 게시글 ID
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: "인증되지 않은 사용자입니다." });
    return;
  }

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
      relations: ["author"],
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    const comment = commentRepository.create({
      content,
      author: req.user,
      post,
    });

    await commentRepository.save(comment);

    res.status(201).json(comment);
  } catch (error) {
    console.error("댓글 추가 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 특정 게시글의 모든 댓글 조회 컨트롤러
const getCommentsByPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentRepository = getRepository(Comment);
  const postRepository = getRepository(Post);
  const { id } = req.params; // 게시글 ID

  try {
    const post = await postRepository.findOne({ where: { id: Number(id) } });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
      return;
    }

    const comments = await commentRepository.find({
      where: { post: { id: Number(id) } },
      relations: ["author"],
      order: { created_at: "ASC" },
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error("댓글 조회 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export { addComment, getCommentsByPost };
