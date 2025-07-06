import { Request, Response } from "express";
import prisma from "../prisma/client";
import { transferPointSchema } from "../validations/point-validation";

export const transferPoint = async (req: Request, res: Response) => {
  const senderId = res.locals.user.id;

  try {
    const { error, value } = transferPointSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Validasi gagal",
        details: error.details.map((err) => err.message),
      });
      return;
    }

    const { targetUserId, point } = value;

    if (targetUserId === senderId) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Tidak bisa transfer ke diri sendiri",
      });
      return;
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: targetUserId } }),
    ]);

    if (!receiver) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Target user tidak ditemukan",
      });
      return;
    }

    if (!sender || sender.point < point) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Poin tidak mencukupi untuk transfer",
      });
      return;
    }

    // ⛓️ Prisma Transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: senderId },
        data: { point: { decrement: point } },
      }),
      prisma.user.update({
        where: { id: targetUserId },
        data: { point: { increment: point } },
      }),
    ]);

    res.status(200).json({
      status: "success",
      code: 200,
      message: `Berhasil transfer ${point} poin ke user ID ${targetUserId}`,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal transfer poin",
      details: [error.message],
    });
  }
};
