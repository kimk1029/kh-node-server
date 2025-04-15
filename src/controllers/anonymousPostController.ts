import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { AnonymousPost } from "../entities/AnonymousPost";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousLike } from "../entities/AnonymousLike";
import bcrypt from "bcrypt";
import { Request } from "express";

// 게시글 작성
const createAnonymousPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousPostRepository = getRepository(AnonymousPost);
  const { title, content } = req.body;

  if (!title || !content ) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const anonymousPost = anonymousPostRepository.create({
      title,
      content,
    });

    await anonymousPostRepository.save(anonymousPost);
    res.status(201).json(anonymousPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 목록 조회
const getAllAnonymousPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousPostRepository = getRepository(AnonymousPost);

  try {
    const anonymousPosts = await anonymousPostRepository
      .createQueryBuilder("anonymousPost")
      .leftJoin("anonymousPost.comments", "anonymousComment")
      .leftJoin("anonymousPost.likes", "anonymousLike")
      .select([
        "anonymousPost.id",
        "anonymousPost.title",
        "anonymousPost.content",
        "anonymousPost.created_at",
        "anonymousPost.views",
        "anonymousPost.anonymousNickname",
      ])
      .addSelect("COUNT(DISTINCT anonymousComment.id)", "comments")
      .addSelect("COUNT(DISTINCT anonymousLike.id)", "likes")
      .groupBy("anonymousPost.id")
      .orderBy("anonymousPost.created_at", "DESC")
      .getRawAndEntities();

    const anonymousPostsWithCounts = anonymousPosts.entities.map((anonymousPost, index) => ({
      ...anonymousPost,
      comments: Number(anonymousPosts.raw[index]["comments"]),
      likes: Number(anonymousPosts.raw[index]["likes"]),
    }));

    res.status(200).json(anonymousPostsWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 상세 조회
const getAnonymousPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousPostRepository = getRepository(AnonymousPost);
  const { id } = req.params;

  try {
    // 조회수 증가
    await anonymousPostRepository
      .createQueryBuilder()
      .update(AnonymousPost)
      .set({ views: () => "views + 1" })
      .where("id = :id", { id: Number(id) })
      .execute();

    const anonymousPost = await anonymousPostRepository.findOne({
      where: { id: Number(id) },
      relations: ["comments", "comments.replies"],
    });

    if (!anonymousPost) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    res.status(200).json(anonymousPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 수정
const updateAnonymousPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousPostRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const anonymousPost = await anonymousPostRepository.findOne({
      where: { id: Number(id) },
    });

    if (!anonymousPost) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, anonymousPost.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    anonymousPost.title = title;
    anonymousPost.content = content;
    await anonymousPostRepository.save(anonymousPost);

    res.status(200).json(anonymousPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 삭제
const deleteAnonymousPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousPostRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: "비밀번호를 입력해주세요" });
    return;
  }

  try {
    const anonymousPost = await anonymousPostRepository.findOne({
      where: { id: Number(id) },
    });

    if (!anonymousPost) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, anonymousPost.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    await anonymousPostRepository.remove(anonymousPost);
    res.status(200).json({ message: "게시글이 삭제되었습니다" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 좋아요 토글
const toggleAnonymousLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const anonymousLikeRepository = getRepository(AnonymousLike);
  const anonymousPostRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const ipAddress = req.ip;

  try {
    const anonymousPost = await anonymousPostRepository.findOne({
      where: { id: Number(id) },
    });

    if (!anonymousPost) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const existingAnonymousLike = await anonymousLikeRepository.findOne({
      where: { post: { id: Number(id) }, ipAddress },
    });

    if (existingAnonymousLike) {
      await anonymousLikeRepository.remove(existingAnonymousLike);
      res.status(200).json({ message: "좋아요가 취소되었습니다" });
    } else {
      const newAnonymousLike = anonymousLikeRepository.create({
        post: anonymousPost,
        ipAddress,
      });
      await anonymousLikeRepository.save(newAnonymousLike);
      res.status(201).json({ message: "좋아요가 추가되었습니다" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

export {
  createAnonymousPost,
  getAllAnonymousPosts,
  getAnonymousPostById,
  updateAnonymousPost,
  deleteAnonymousPost,
  toggleAnonymousLike,
}; 