import { Request, Response } from "express";
import { register, login } from "../services/auth-service";
import { registerSchema, loginSchema } from "../validations/auth-validation";
import { verifyToken } from "../utils/jwt";
import prisma from "../prisma/client";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.validate(req.body);
    if (validated.error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Email atau password salah.",
      });
      return;
    }

    const result = await register(validated.value);

    res.status(201).json({
      status: "success",
      code: 200,
      message: "User registered",
      data: result.email,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Register failed",
      error: err,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.validate(req.body);
    if (validated.error) {
      res
        .status(400)
        .json({ status: "error", code: 400, message: validated.error.message });
      return;
    }

    const result = await login(validated.value);
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: false, // true kalau pakai HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Login success",
      data: result.user.email,
    });
    return;
  } catch (err) {
    res.status(401).json({
      status: "error",
      code: 401,
      message: "email atau password salah",
      error: err,
    });
    return;
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("token"); // hapus cookie
  res.status(200).json({
    status: "success",
    code: 200,
    message: "Logout berhasil",
  });
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized (no token)" });
      return;
    }

    const payload = verifyToken(token); // id & role dari JWT
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in /auth/check:", err);
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

// GET /auth/me
export const getMe = async (req: Request, res: Response) => {
  const userId = res.locals.user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        point: true,
        profile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "User tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal mengambil data user",
      details: [error.message],
    });
  }
};
