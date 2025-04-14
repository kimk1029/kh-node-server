import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousPost } from "../entities/AnonymousPost";
import bcrypt from "bcrypt";
import { Request } from "express";

// 댓글 작성
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentRepository = getRepository(AnonymousComment);
  const postRepository = getRepository(AnonymousPost);
  const { postId } = req.params;
  const { content, anonymousNickname, password, parentId } = req.body;

  if (!content || !anonymousNickname || !password) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const post = await postRepository.findOne({
      where: { id: Number(postId) },
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const comment = commentRepository.create({
      content,
      anonymousNickname,
      password: hashedPassword,
      ipAddress: req.ip,
      post,
    });

    if (parentId) {
      const parentComment = await commentRepository.findOne({
        where: { id: Number(parentId) },
      });
      if (parentComment) {
        comment.parent = parentComment;
      }
    }

    await commentRepository.save(comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 댓글 수정
const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentRepository = getRepository(AnonymousComment);
  const { id } = req.params;
  const { content, password } = req.body;

  if (!content || !password) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const comment = await commentRepository.findOne({
      where: { id: Number(id) },
    });

    if (!comment) {
      res.status(404).json({ message: "댓글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    comment.content = content;
    await commentRepository.save(comment);

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 댓글 삭제
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const commentRepository = getRepository(AnonymousComment);
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: "비밀번호를 입력해주세요" });
    return;
  }

  try {
    const comment = await commentRepository.findOne({
      where: { id: Number(id) },
    });

    if (!comment) {
      res.status(404).json({ message: "댓글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, comment.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    await commentRepository.remove(comment);
    res.status(200).json({ message: "댓글이 삭제되었습니다" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

export { createComment, updateComment, deleteComment }; 