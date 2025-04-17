import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousPost } from "../entities/AnonymousPost";
import bcrypt from "bcrypt";

// 댓글 작성
const createAnonymousComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const postRepository = getRepository(AnonymousPost);
    const commentRepository = getRepository(AnonymousComment);

    const post = await postRepository.findOne(postId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const comment = commentRepository.create({
      content,
      post
    });

    await commentRepository.save(comment);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "댓글 생성 중 오류가 발생했습니다." });
  }
};

// 댓글 수정
const updateAnonymousComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, password } = req.body;

    const commentRepository = getRepository(AnonymousComment);
    const comment = await commentRepository.findOne(id);

    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }


    comment.content = content;
    await commentRepository.save(comment);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "댓글 수정 중 오류가 발생했습니다." });
  }
};

// 댓글 삭제
const deleteAnonymousComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const commentRepository = getRepository(AnonymousComment);
    const comment = await commentRepository.findOne(id);

    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }


    await commentRepository.remove(comment);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." });
  }
};

export const addAnonymousComment = async (req: Request, res: Response) => {
  try {
    const { content, password } = req.body;
    const { id } = req.params;

    if (!content || !password) {
      return res.status(400).json({ message: "내용과 비밀번호는 필수입니다." });
    }

    const postRepository = getRepository(AnonymousPost);
    const post = await postRepository.findOne(id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const commentRepository = getRepository(AnonymousComment);
    const comment = commentRepository.create({
      content,
      post,
    });

    await commentRepository.save(comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export const getAnonymousCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const commentRepository = getRepository(AnonymousComment);
    const comments = await commentRepository.find({
      where: { post: { id } },
      order: { createdAt: "ASC" },
    });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export { createAnonymousComment, updateAnonymousComment, deleteAnonymousComment }; 