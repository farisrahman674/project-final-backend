import { Request, Response } from "express";
import prisma from "../prisma/client";
import { POINT_RATE } from "../utils/env";
import { orderSchema } from "../validations/order-validation";

export const createOrder = async (req: Request, res: Response) => {
  const userId = Number(res.locals.user?.id);
  const { error, value } = orderSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "Data order tidak valid",
      details: error.details.map((err) => err.message),
    });
    return;
  }
  const { items } = value;

  try {
    const ordersToCreate = [];
    let totalPoints = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id_product: item.productId },
      });

      if (!product || product.deletedAt) {
        res.status(404).json({
          status: "error",
          code: 404,
          message: `Produk dengan ID ${item.productId} tidak ditemukan`,
        });
        return;
      }

      const total = product.price * item.quantity;
      const point = Math.floor(total / POINT_RATE);
      totalPoints += point;

      ordersToCreate.push({
        data: {
          userId,
          productId: item.productId,
          quantity: item.quantity,
          total,
          status: "pending",
        },
      });
    }

    // Simpan semua order sekaligus
    const createdOrders = await prisma.$transaction(
      ordersToCreate.map((order) => prisma.order.create(order))
    );

    // Buat auto-confirm untuk semua
    setTimeout(async () => {
      try {
        const pendingOrders = await prisma.order.findMany({
          where: {
            userId,
            status: "pending",
            id_order: { in: createdOrders.map((o) => o.id_order) },
          },
        });

        if (pendingOrders.length > 0) {
          await prisma.$transaction([
            ...pendingOrders.map((o) =>
              prisma.order.update({
                where: { id_order: o.id_order },
                data: { status: "success" },
              })
            ),
            prisma.user.update({
              where: { id: userId },
              data: {
                point: { increment: totalPoints },
              },
            }),
          ]);
        }
      } catch (err) {
        console.error("Gagal auto-success:", err);
      }
    }, 60000);

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Semua order berhasil dibuat",
      data: {
        jumlahOrder: createdOrders.length,
        poinDidapat: totalPoints,
        status: "pending",
      },
    });
  } catch (err: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal membuat order",
      details: [err.message],
    });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { not: "cancelled" }, // Soft deleted tidak ditampilkan
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
            image: true, // ✅ Tambahkan ini
          },
        }, // Biar kelihatan nama/price produk
      },
      orderBy: {
        createdAt: "desc", // Terbaru duluan
      },
    });
    const formattedOrders = orders.map((order) => ({
      id: order.id_order,
      email: order.user.email,
      image: order.product.image,
      product: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      total: order.total,
      status: order.status,
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
        status: { not: "cancelled" },
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
      id: order.id_order,
      email: order.user.email,
      product: order.product.name,
      quantity: order.quantity,
      price: order.product.price,
      total: order.total,
      status: order.status,
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
        status: { not: "cancelled" },
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

    if (existingOrder.status === "cancelled") {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Order sudah dibatalkan sebelumnya",
      });
      return;
    }

    if (existingOrder.status === "success") {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Order sudah berhasil dan tidak bisa dibatalkan",
      });
      return;
    }

    await prisma.order.update({
      where: { id_order: orderId },
      data: {
        status: "cancelled",
      },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Order berhasil dibatalkan",
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
