import jwt from "jsonwebtoken";
import { User } from "../entities/User";

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
};

export default generateToken;
