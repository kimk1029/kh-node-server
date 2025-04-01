import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { isPublicRoute } from "./isPublicRoute";

// Extend the Express Request interface to include a user property
export interface AuthRequest extends Request {
  user?: User;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const path = req.path;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (isPublicRoute(path)) {
      next();
      return;
    }
    res.status(401).json({ message: "Unauthorized:: No token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Unauthorized:: User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized:: Invalid token" });
  }
};

export default authMiddleware;
