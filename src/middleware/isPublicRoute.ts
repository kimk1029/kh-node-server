import { Request, Response, NextFunction } from "express";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/anonymous",
  "/anonymous/:id",
  "/anonymous/:id/comments",
];

export const isPublicRoute = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  const isPublic = publicRoutes.some((route) => {
    const routePattern = new RegExp(
      "^" + route.replace(/:[^/]+/g, "[^/]+") + "$"
    );
    return routePattern.test(path);
  });

  if (isPublic) {
    return next();
  }

  return res.status(403).json({ message: "접근이 금지된 경로입니다." });
}; 