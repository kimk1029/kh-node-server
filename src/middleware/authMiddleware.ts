import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthUser {
  id: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    console.log("[r][e][q]1");
    req.user = { id: decoded.id };
    next();
    console.log("[r][e][q]44")
  } catch (error) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export default authMiddleware; 