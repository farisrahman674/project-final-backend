import prisma from "../prisma/client";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export const register = async (data: {
  email: string;
  password: string;
  role: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Email already exists");

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashed,
    },
  });

  return { id: user.id, email: user.email };
};

export const login = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(data.password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, role: user.role });

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};
