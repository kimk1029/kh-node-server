import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Post } from "../entities/Post";
import { AuthRequest } from "../middlewares/authMiddleware";

// 게시글 작성 컨트롤러
const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);
  const { title, content } = req.body;
  console.log("title, content", title, content);
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

    await postRepository.save(post);

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 모든 게시글 조회 컨트롤러
const getAllPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);

  try {
    const posts = await postRepository.find({
      relations: ["author"],
      order: { created_at: "DESC" },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 특정 게시글 조회 컨트롤러
const getPostById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);
  const { id } = req.params;

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
      relations: ["author"],
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createPost, getAllPosts, getPostById };
