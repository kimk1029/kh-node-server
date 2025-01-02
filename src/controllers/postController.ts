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
    // 게시글과 작성자 정보를 가져오면서 각 게시글의 댓글 수를 계산
    const posts = await postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoin("post.comments", "comment")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.created_at",
        "post.views",
        "author.id",
        "author.username",
      ])
      .addSelect("COUNT(comment.id)", "comments") // 댓글 수 계산
      .groupBy("post.id")
      .addGroupBy("author.id")
      .orderBy("post.created_at", "DESC")
      .getRawAndEntities();

    // Raw 데이터를 사용하여 댓글 수를 각 게시글에 매핑
    const postsWithCommentCount = posts.entities.map((post, index) => ({
      ...post,
      comments: Number(posts.raw[index]["comments"]), // 문자열을 숫자로 변환
    }));

    res.status(200).json(postsWithCommentCount);
  } catch (error) {
    console.error("Error fetching posts:", error);
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
    // 조회수 1 증가
    await postRepository
      .createQueryBuilder()
      .update(Post)
      .set({ views: () => "views + 1" })
      .where("id = :id", { id: Number(id) })
      .execute();

    // 게시글 조회
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
const updatePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);
  const { id } = req.params;
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
    const post = await postRepository.findOne({
      where: { id: Number(id) },
      relations: ["author"],
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // 현재 사용자가 게시글 작성자인지 확인
    if (post.author.id !== req.user.id) {
      res
        .status(403)
        .json({ message: "Forbidden: You can only edit your own posts" });
      return;
    }

    // 게시글 업데이트
    post.title = title;
    post.content = content;

    await postRepository.save(post);

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// 게시글 삭제 컨트롤러
const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("---------------deletePost");
  const postRepository = getRepository(Post);
  const { id } = req.params;

  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const post = await postRepository.findOne({
      where: { id: Number(id) },
      relations: ["author"],
    });

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // 현재 사용자가 게시글 작성자인지 확인
    if (post.author.id !== req.user.id) {
      res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own posts" });
      return;
    }

    await postRepository.remove(post);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export { createPost, getAllPosts, getPostById, updatePost, deletePost };
