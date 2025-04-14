import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { AnonymousPost } from "../entities/AnonymousPost";
import { AnonymousComment } from "../entities/AnonymousComment";
import { AnonymousLike } from "../entities/AnonymousLike";
import bcrypt from "bcrypt";
import { Request } from "express";

// 게시글 작성
const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(AnonymousPost);
  const { title, content, anonymousNickname, password } = req.body;

  if (!title || !content || !anonymousNickname || !password) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const post = postRepository.create({
      title,
      content,
      anonymousNickname,
      password: hashedPassword,
      ipAddress: req.ip
    });

    await postRepository.save(post);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 목록 조회
const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(AnonymousPost);

  try {
    const posts = await postRepository
      .createQueryBuilder("post")
      .leftJoin("post.comments", "comment")
      .leftJoin("post.likes", "like")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.created_at",
        "post.views",
        "post.anonymousNickname",
      ])
      .addSelect("COUNT(DISTINCT comment.id)", "comments")
      .addSelect("COUNT(DISTINCT like.id)", "likes")
      .groupBy("post.id")
      .orderBy("post.created_at", "DESC")
      .getRawAndEntities();

    const postsWithCounts = posts.entities.map((post, index) => ({
      ...post,
      comments: Number(posts.raw[index]["comments"]),
      likes: Number(posts.raw[index]["likes"]),
    }));

    res.status(200).json(postsWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 상세 조회
const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(AnonymousPost);
  const { id } = req.params;

  try {
    // 조회수 증가
    await postRepository
      .createQueryBuilder()
      .update(AnonymousPost)
      .set({ views: () => "views + 1" })
      .where("id = :id", { id: Number(id) })
      .execute();

    const post = await postRepository.findOne({
      where: { id: Number(id) },
      relations: ["comments", "comments.replies"],
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 수정
const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const { title, content, password } = req.body;

  if (!title || !content || !password) {
    res.status(400).json({ message: "모든 필드를 입력해주세요" });
    return;
  }

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, post.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    post.title = title;
    post.content = content;
    await postRepository.save(post);

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시글 삭제
const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: "비밀번호를 입력해주세요" });
    return;
  }

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, post.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    await postRepository.remove(post);
    res.status(200).json({ message: "게시글이 삭제되었습니다" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 좋아요 토글
const toggleLike = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const likeRepository = getRepository(AnonymousLike);
  const postRepository = getRepository(AnonymousPost);
  const { id } = req.params;
  const ipAddress = req.ip;

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
    });

    if (!post) {
      res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
      return;
    }

    const existingLike = await likeRepository.findOne({
      where: { post: { id: Number(id) }, ipAddress },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      res.status(200).json({ message: "좋아요가 취소되었습니다" });
    } else {
      const newLike = likeRepository.create({
        post,
        ipAddress,
      });
      await likeRepository.save(newLike);
      res.status(201).json({ message: "좋아요가 추가되었습니다" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러" });
  }
};

export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
}; 