import { Request, Response } from "express";
import prisma from "../prisma/client";
import { POINT_RATE } from "../utils/env";
import { orderSchema } from "../validations/order-validation";

export const createOrder = async (req: Request, res: Response) => {
  const userId = Number(res.locals.user?.id);
  const { error, value } = orderSchema.validate(req.body);

  try {
    const { productId, quantity } = value;
    // Validasi input
    if (error) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Data order tidak valid",
        details: error.details.map((err) => err.message),
      });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id_product: productId },
    });

    if (!product || product.deletedAt) {
      res.status(404).json({
        status: "error",
        code: 400,
        message: "Produk tidak ditemukan",
      });
      return;
    }

    const total = product.price * quantity;
    const point = Math.floor(total / POINT_RATE);

    // ⛓️ Prisma Transaction
    const [order, updatedUser] = await prisma.$transaction([
      prisma.order.create({
        data: {
          productId,
          userId,
          quantity,
          total,
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          product: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          point: { increment: point },
        },
      }),
    ]);
    const formattedOrder = {
      email: order.user.email,
      product: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      total: order.total,
    };
    res.status(201).json({
      status: "success",
      code: 201,
      message: "Order berhasil dibuat",
      data: {
        order: formattedOrder,
        poinDidapat: point,
        totalPembayaran: total,
        totalPointUser: updatedUser.point,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal membuat order",
      details: [error.message],
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId,
        deletedAt: null, // Soft deleted tidak ditampilkan
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        product: true, // Biar kelihatan nama/price produk
      },
      orderBy: {
        createdAt: "desc", // Terbaru duluan
      },
    });
    const formattedOrders = orders.map((order) => ({
      email: order.user.email,
      product: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      total: order.total,
    }));
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Daftar order milik user",
      data: formattedOrders,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal mengambil data order",
      details: [error.message],
    });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        product: {
          select: {
            id_product: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const formattedOrders = orders.map((order) => ({
      email: order.user.email,
      product: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      total: order.total,
    }));
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Daftar semua order",
      data: formattedOrders,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal mengambil data order",
      details: [error.message],
    });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const userId = res.locals.user.id;

  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        id_order: orderId,
        userId: userId,
        deletedAt: null,
      },
    });

    if (!existingOrder) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Order tidak ditemukan atau sudah dibatalkan",
      });
      return;
    }

    await prisma.order.update({
      where: { id_order: orderId },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Order berhasil dibatalkan (soft delete)",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal membatalkan order",
      details: [error.message],
    });
  }
};
