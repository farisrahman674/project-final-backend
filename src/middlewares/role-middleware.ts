import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth-middleware";
import prisma from "../prisma/client";

export const authorizeRole = (...role: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = Number(res.locals.user?.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        details: "User info not found",
      });
      return;
    }

    if (!user || !role.includes(user.role)) {
      res.status(403).json({
        status: "error",
        code: 403,
        message: "Forbidden",
        details: `Access restricted to ${role} only`,
      });
      return;
    }

    next();
  };
};
