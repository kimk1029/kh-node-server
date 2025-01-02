import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entities/User";
import generateToken from "../utils/generateToken";

// 회원가입 컨트롤러
const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRepository = getRepository(User);
    const { username, email, password } = req.body;

    // 필수 필드 확인
    if (!username || !email || !password) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    // 사용자 중복 확인
    const existingUser = await userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      res.status(400).json({ message: "Username or email already exists" });
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    await userRepository.save(user);

    // JWT 토큰 생성
    const token = generateToken(user);

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 로그인 컨트롤러
const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("## login", req.body);
    const userRepository = getRepository(User);
    const { email, password } = req.body;
    console.log("### email, password", email, password);
    // 필수 필드 확인
    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" });
      return;
    }

    // 사용자 조회
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      console.log("user not found");
      res
        .status(400)
        .json({ message: "Invalid credentials :: user not found" });
      return;
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("passwd not found");
      res
        .status(400)
        .json({ message: "Invalid credentials :: passwd not found" });
      return;
    }

    // JWT 토큰 생성
    const token = generateToken(user);
    console.log("### token", token);
    console.log("### user", user);
    res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// 사용자 존재 여부를 확인하는 컨트롤러
const checkUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRepository = getRepository(User);
    const { email } = req.body;

    // 이메일 필드 확인
    if (!email) {
      res.status(400).json({ message: "이메일이 필요합니다." });
      return;
    }

    // 데이터베이스에서 사용자 조회
    const user = await userRepository.findOne({ where: { email } });

    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("checkUser Error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export { register, login, checkUser };
