// controllers/cartController.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";

export const getMyCart = async (req: Request, res: Response) => {
  const userId = res.locals.user?.id;
  try {
    const carts = await prisma.cart.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        product: true, // join product
      },
    });

    res.status(200).json({
      status: "success",
      data: carts,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengambil cart",
      details: [error.message],
    });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = res.locals.user?.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "productId dan quantity wajib diisi",
    });
    return;
  }

  try {
    const existing = await prisma.cart.findFirst({
      where: {
        userId,
        productId,
        deletedAt: null,
      },
    });

    if (existing) {
      // update quantity
      const updated = await prisma.cart.update({
        where: {
          id_cart: existing.id_cart,
        },
        data: {
          quantity: existing.quantity + quantity,
          updatedAt: new Date(),
        },
      });

      res.status(200).json({
        status: "success",
        message: "Quantity diperbarui",
        data: updated,
      });
      return;
    }

    const newCart = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Produk berhasil ditambahkan ke keranjang",
      data: newCart,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal menambahkan ke keranjang",
      details: [error.message],
    });
  }
};

// routes/cart.ts atau controller/cart.ts
export const updateCartQuantity = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400).json({
      status: "fail",
      code: 400,
      message: "Quantity harus lebih dari 0",
    });
    return;
  }

  try {
    const cart = await prisma.cart.update({
      where: { id_cart: id },
      data: { quantity, updatedAt: new Date() },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Jumlah berhasil diubah",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal update cart",
      details: [error.message],
    });
  }
};

export const softDeleteCart = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const cart = await prisma.cart.update({
      where: { id_cart: id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Item dihapus dari cart (soft delete)",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal menghapus cart",
      details: [error.message],
    });
  }
};

export const clearMyCart = async (req: Request, res: Response) => {
  const userId = res.locals.user?.id;
  try {
    await prisma.cart.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Seluruh cart berhasil dikosongkan",
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Gagal mengosongkan cart",
      details: [error.message],
    });
  }
};
