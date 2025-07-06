import { Request, Response } from "express";
import prisma from "../prisma/client";

export const uploadProfileImage = async (req: Request, res: Response) => {
  const userId = res.locals.user?.id;

  if (!req.file) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "File gambar wajib diupload",
    });
    return;
  }

  const filename = req.file.filename;

  await prisma.user.update({
    where: { id: userId },
    data: {
      profile: filename,
    },
  });

  res.status(200).json({
    status: "success",
    code: 200,
    message: "Gambar profil berhasil diupload",
    filename,
  });
};
