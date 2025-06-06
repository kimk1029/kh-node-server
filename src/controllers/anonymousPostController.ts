import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { AnonymousPost } from "../entities/AnonymousPost";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousLike } from "../entities/AnonymousLike";
import bcrypt from "bcrypt";

// 게시글 작성
export const createAnonymousPost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!title || !content) {
      return res.status(400).json({ message: "제목과 내용은 필수입니다." });
    }

    const postRepository = getRepository(AnonymousPost);
    const post = postRepository.create({
      title,
      content,
      ipAddress,
    });

    await postRepository.save(post);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 게시글 목록 조회
export const getAllAnonymousPosts = async (req: Request, res: Response) => {
  try {
    const postRepository = getRepository(AnonymousPost);
    const posts = await postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.likes", "likes")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.created_at",
        "post.views",
        "COUNT(DISTINCT comments.id) as commentsCount",
        "COUNT(DISTINCT likes.id) as likesCount"
      ])
      .groupBy("post.id")
      .orderBy("post.created_at", "DESC")
      .getRawMany();

    const formattedPosts = posts.map(post => ({
      id: post.post_id,
      title: post.post_title,
      content: post.post_content,
      created_at: post.post_created_at,
      views: post.post_views,
      comments: Number(post.commentsCount) || 0,
      likes: Number(post.likesCount) || 0
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 게시글 상세 조회
export const getAnonymousPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const postRepository = getRepository(AnonymousPost);
    const post = await postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.comments", "comments")
      .leftJoinAndSelect("post.likes", "likes")
      .where("post.id = :id", { id })
      .getOne();

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // 조회수 증가
    post.views += 1;
    await postRepository.save(post);

    // 작성자 여부 확인
    const isAuthor = post.ipAddress === ipAddress;

    res.json({
      ...post,
      isAuthor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 게시글 수정
export const updateAnonymousPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const postRepository = getRepository(AnonymousPost);
    const post = await postRepository.findOne(id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.ipAddress !== ipAddress) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    post.title = title;
    post.content = content;
    await postRepository.save(post);

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 게시글 삭제
export const deleteAnonymousPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const postRepository = getRepository(AnonymousPost);
    const post = await postRepository.findOne(id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.ipAddress !== ipAddress) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    await postRepository.remove(post);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 좋아요 토글
export const toggleAnonymousLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const postRepository = getRepository(AnonymousPost);
    const likeRepository = getRepository(AnonymousLike);

    const post = await postRepository.findOne(id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    const existingLike = await likeRepository.findOne({
      where: { post: { id: Number(id) }, ipAddress },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      res.json({ message: "좋아요가 취소되었습니다." });
    } else {
      const like = likeRepository.create({
        post,
        ipAddress,
      });
      await likeRepository.save(like);
      res.json({ message: "좋아요가 추가되었습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}; 