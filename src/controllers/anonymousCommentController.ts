import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousPost } from "../entities/AnonymousPost";
import bcrypt from "bcrypt";

// 댓글 작성
const createAnonymousComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, password } = req.body;

    const postRepository = getRepository(AnonymousPost);
    const commentRepository = getRepository(AnonymousComment);

    const post = await postRepository.findOne(postId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const comment = commentRepository.create({
      content,
      password: hashedPassword,
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

    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
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

    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await commentRepository.remove(comment);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "댓글 삭제 중 오류가 발생했습니다." });
  }
};

export { createAnonymousComment, updateAnonymousComment, deleteAnonymousComment }; 