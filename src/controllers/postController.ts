import { Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Post } from "../entities/Post";
import { AuthRequest } from "../middleware/authMiddleware";
import { Like } from "../entities/Like";
import { Comment } from "../entities/Comment";
// 게시글 작성 컨트롤러
const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);
  console.log("[[[[[[[[[[[[[[create]]]]]]]]]]]]");  
  // FormData에서 데이터 추출
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;

  if (!title || !content || !category) {
    res.status(400).json({ message: "제목, 내용, 카테고리는 필수입니다." });
    return;
  }

  // 유효한 카테고리 값인지 확인
  const validTags = ['technology', 'science', 'health', 'business', 'entertainment', 'news'];
  if (!validTags.includes(category)) {
    res.status(400).json({ 
      message: "유효하지 않은 카테고리입니다.",
      validTags 
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: "인증이 필요합니다." });
    return;
  }

  try {
    console.log("[[[[[[[[[[[[[[IMAGE]]]]]]]]]]]]]]", req.file);
    // 이미지 파일 경로 추출 (단일 파일)
    const images = req.file ? [req.file.filename] : [];

    const post = postRepository.create({
      title,
      content,
      tag: category,
      images,
      author: { id: Number(req.user.id) }
    });

    await postRepository.save(post);

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 모든 게시글 조회 컨트롤러
const getAllPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const postRepository = getRepository(Post);
  const { category } = req.query; // 쿼리 파라미터에서 tag 값을 가져옴

  try {
    // 쿼리 빌더 생성
    const queryBuilder = postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoin("post.comments", "comment")
      .leftJoin("post.likes", "like")
      .select([
        "post.id",
        "post.title",
        "post.content",
        "post.created_at",
        "post.views",
        "author.id",
        "author.username",
        "post.tag"
      ])
      .addSelect("COUNT(DISTINCT comment.id)", "comments")
      .addSelect("COUNT(DISTINCT like.id)", "likes")
      .groupBy("post.id")
      .addGroupBy("author.id")
      .orderBy("post.created_at", "DESC");

    // tag가 있는 경우 필터링 조건 추가
    if (category) {
      queryBuilder.andWhere("post.tag = :tag", { category });
    }

    const posts = await queryBuilder.getRawAndEntities();

    // Raw 데이터를 사용하여 댓글 수와 좋아요 수를 각 게시글에 매핑
    const postsWithCommentAndLikeCount = posts.entities.map((post, index) => ({
      ...post,
      comments: Number(posts.raw[index]["comments"]),
      likes: Number(posts.raw[index]["likes"]),
      category: post.tag,
    }));

    res.status(200).json(postsWithCommentAndLikeCount);
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
  const commentRepository = getRepository(Comment);
  const likeRepository = getRepository(Like);
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

    // 댓글 갯수 조회
    const commentCount = await commentRepository.count({
      where: { post: { id: Number(id) } },
    });

    // 좋아요 갯수 조회
    const likeCount = await likeRepository.count({
      where: { post: { id: Number(id) } },
    });

    const userId = req.user?.id;
    let liked = false;
    if (userId) {
      const userLike = await likeRepository.findOne({
        where: { post: { id: Number(id) }, user: { id: Number(userId) } },
      });
      liked = !!userLike;
    }

    // 이미지 URL 생성
    const imageUrls = post.images ? post.images.map(image => `/uploads/${image}`) : [];

    // 게시글 데이터와 추가 데이터 반환
    res.status(200).json({ 
      ...post, 
      commentCount, 
      likeCount, 
      liked,
      imageUrls,
      category: post.tag 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getPostById;
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
    if (post.author.id !== Number(req.user.id)) {
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
    if (post.author.id !== Number(req.user.id)) {
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
const getLikedPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const likeRepository = getRepository(Like);
  const userId = req.user?.id; // 인증된 사용자 ID

  try {
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 사용자가 좋아요한 게시글 조회
    const likes = await likeRepository.find({
      where: { user: { id: userId } },
      relations: ["post"], // 게시글 관계를 함께 가져옴
    });

    const likedPosts = likes.map((like) => like.post);

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const toggleLike = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const likeRepository = getRepository(Like);
  const postRepository = getRepository(Post);
  const { id: postId } = req.params;
  const userId = req.user?.id; // 인증된 사용자 ID

  try {
    // 게시글 존재 여부 확인
    const post = await postRepository.findOne(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // 좋아요 상태 확인
    const existingLike = await likeRepository.findOne({
      where: { post: { id: Number(postId) }, user: { id: Number(userId) } },
    });

    if (existingLike) {
      // 이미 좋아요를 눌렀다면 삭제
      await likeRepository.remove(existingLike);
      res.status(200).json({ message: "Like removed" });
    } else {
      // 좋아요 추가
      const newLike = likeRepository.create({
        post,
        user: { id: Number(userId) }
      });
      await likeRepository.save(newLike);
      res.status(201).json({ message: "Like added" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getLikedPosts,
  toggleLike,
};
