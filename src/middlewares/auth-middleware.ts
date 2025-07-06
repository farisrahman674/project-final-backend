import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "supersecretkey"; // bisa pakai process.env.JWT_SECRET nanti

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.cookies?.token;
  if (!authHeader) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized",
      details: "No token provided in Authorization header",
    });
    return;
  }

  const token = authHeader;

  try {
    const decoded = jwt.verify(token, SECRET) as { id: number; role: string };
    res.locals.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized",
      details: "Invalid or expired token",
    });
    return;
  }
};
