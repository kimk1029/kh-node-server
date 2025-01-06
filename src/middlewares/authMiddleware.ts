import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../entities/User";

// Extend the Express Request interface to include a user property
export interface AuthRequest extends Request {
  user?: User;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("AUTH MIDDLEWARE", req.headers);
  const authHeader = req.headers.authorization;

  console.log("AUTH123");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized:: No token" });
    return;
  }
  console.log("AUTH123");
  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userRepository = getRepository(User);
    const user = await userRepository.findOne(decoded.id);
    console.log("AUTH12");
    if (!user) {
      res.status(401).json({ message: "Unauthorized:: User not found" });
      return;
    }
    console.log("AUTH1");

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized:: Invalid token" });
  }
};

export default authMiddleware;
