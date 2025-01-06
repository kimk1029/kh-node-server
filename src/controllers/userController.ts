// src/controllers/userController.ts

import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { Comment } from "../entities/Comment";
import { AuthRequest } from "../middlewares/authMiddleware";

// 모든 사용자 조회 컨트롤러 (기존)
const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ...
};

// 특정 사용자 조회 컨트롤러 (기존)
const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // ...
};

/**
 * (신규) 내 계정 정보 + 내가 작성한 게시글 + 내가 작성한 댓글 조회
 * GET /api/account
 */
const getMyAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) 우선 쿼리 파라미터로 넘어온 id(문자열)를 가져옴
    const idFromQuery = req.query.id;

    // 2) 만약 쿼리에 id가 있으면 그걸 사용, 없으면 JWT 인증 결과인 req.user.id 사용
    let userId: number | null = null;
    if (idFromQuery) {
      userId = Number(idFromQuery);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid user id" });
        return;
      }
    } else if (req.user) {
      userId = req.user.id;
    } else {
      // id도 없고 req.user도 없다면 → 인증/식별 불가
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userRepository = getRepository(User);
    const postRepository = getRepository(Post);
    const commentRepository = getRepository(Comment);

    // 3) DB에서 해당 userId로 사용자 조회
    //    비밀번호(password) 같은 민감 정보는 제외
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "username", "email", "created_at"],
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 4) 내가 작성한 게시글
    const myPosts = await postRepository.find({
      where: { author: { id: user.id } },
      order: { created_at: "DESC" },
    });

    // 5) 내가 작성한 댓글 (어떤 게시글에 달렸는지 확인하기 위해 relations: ["post"] )
    const myComments = await commentRepository.find({
      where: { author: { id: user.id } },
      relations: ["post"],
      order: { created_at: "DESC" },
    });

    // 최종 응답: { user, myPosts, myComments }
    res.status(200).json({
      user,
      posts: myPosts,
      comments: myComments,
    });
  } catch (error) {
    console.error("Error in getMyAccount:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/**
 * (신규) 유저 정보 수정 (유저네임/비밀번호 등)
 * PATCH /api/account
 */
const updateMyAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userRepository = getRepository(User);
    const { username, password } = req.body;

    // 현재 로그인한 사용자
    const user = await userRepository.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 변경할 항목이 있으면 업데이트
    if (username) {
      user.username = username;
    }
    if (password) {
      // 실제 서비스에서는 bcrypt 등으로 비밀번호 해싱 필수
      // const hashedPassword = await bcrypt.hash(password, 10);
      user.password = password; // 데모용 (실제로는 해싱해야 안전)
    }

    await userRepository.save(user);

    res.status(200).json({
      message: "User updated",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error in updateMyAccount:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getAllUsers, getUserById, getMyAccount, updateMyAccount };
