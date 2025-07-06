import jwt from "jsonwebtoken";

const SECRET = "supersecretkey"; // kamu bisa hardcode atau pakai .env

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, SECRET);
};
