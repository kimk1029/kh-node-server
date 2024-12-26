// src/controllers/userController.ts

import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";

// 모든 사용자 조회 컨트롤러
const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userRepository = getRepository(User);

  try {
    const users = await userRepository.find({
      select: ["id", "username", "email", "created_at"], // 비밀번호 제외
      relations: ["posts"], // 관련된 게시글도 함께 조회 (선택 사항)
      order: { created_at: "DESC" },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 특정 사용자 조회 컨트롤러 (선택 사항)
const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userRepository = getRepository(User);
  const { id } = req.params;

  try {
    const user = await userRepository.findOne({
      where: { id: Number(id) },
      select: ["id", "username", "email", "created_at"],
      relations: ["posts"],
    });

    if (!user) {
      res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export { getAllUsers, getUserById };
