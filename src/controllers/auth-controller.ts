import { Request, Response } from "express";
import { register, login } from "../services/auth-service";
import { registerSchema, loginSchema } from "../validations/auth-validation";

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

    res
      .status(201)
      .json({
        status: "success",
        code: 200,
        message: "User registered",
        data: result.email,
      });
  } catch (err) {
    res
      .status(500)
      .json({
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
    res
      .status(200)
      .json({
        status: "success",
        code: 200,
        message: "Login success",
        data: result.user.email,
      });
    return;
  } catch (err) {
    res
      .status(500)
      .json({
        status: "error",
        code: 500,
        message: "Login failed",
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
