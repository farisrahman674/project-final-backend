import { Request, Response } from "express";
import prisma from "../prisma/client";

export const createProduct = async (req: Request, res: Response) => {
  const { name, price } = req.body;
  const image = req.file?.filename;
  if (!req.file) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "Gambar produk wajib diupload",
      details: "Field image tidak boleh kosong",
    });
    return;
  }
  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        image,
      },
    });

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Produk berhasil ditambahkan",
      data: {
        name: newProduct.name,
        price: newProduct.price,
        image: newProduct.image,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal menambahkan produk",
      details: [error.message],
    });
  }
};

export const updateProductImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.file) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "Gambar baru wajib diupload",
      details: ["Field image tidak boleh kosong"],
    });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id_product: Number(id) },
    });

    if (!product) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Produk tidak ditemukan",
      });
      return;
    }

    const updated = await prisma.product.update({
      where: { id_product: Number(id) },
      data: {
        image: req.file.filename,
      },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Gambar produk berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal memperbarui gambar",
      details: [error.message],
    });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  const search = req.query.search?.toString() || "";
  const sortBy = req.query.sortBy?.toString() || "createdAt"; // default
  const order = req.query.order === "desc" ? "asc" : "desc"; // default
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null, // hanya tampilkan yang belum dihapus
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        id_product: true,
        name: true,
        price: true,
        image: true,
      },
      orderBy: {
        [sortBy]: order,
      },
      skip,
      take: limit,
    });
    const total = await prisma.product.count({
      where: {
        deletedAt: null,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Daftar produk berhasil diambil",
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal mengambil produk",
      details: [error.message],
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({
      status: "fail",
      code: 400,
      message: "ID produk tidak valid",
    });
    return;
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id_product: id,
      },
      select: {
        id_product: true,
        name: true,
        price: true,
        image: true,
        description: true,
      },
    });

    if (!product) {
      res.status(404).json({
        status: "fail",
        code: 404,
        message: "Produk tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Detail produk berhasil diambil",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal mengambil produk",
      details: [error.message],
    });
  }
};

export const softDeleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id_product: Number(id) },
    });

    if (!product) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Produk tidak ditemukan",
        details: [`Produk dengan ID ${id} tidak ada`],
      });
      return;
    }

    if (product.deletedAt) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Produk sudah dihapus sebelumnya",
      });
      return;
    }

    const updated = await prisma.product.update({
      where: { id_product: Number(id) },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Produk berhasil dihapus (soft delete)",
      data: { name: updated.name, price: updated.price, image: updated.image },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal soft delete produk",
      details: [error.message],
    });
  }
};

export const restoreProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.product.findUnique({
      where: { id_product: Number(id) },
    });

    if (!existing) {
      res.status(404).json({
        status: "error",
        code: 404,
        message: "Produk tidak ditemukan",
        details: [`ID ${id} tidak ada dalam database`],
      });
      return;
    }

    if (!existing.deletedAt) {
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Produk ini belum dihapus",
        details: [`ID ${id} masih aktif`],
      });
      return;
    }

    const restored = await prisma.product.update({
      where: { id_product: Number(id) },
      data: {
        deletedAt: null,
      },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Produk berhasil direstore",
      data: {
        name: restored.name,
        price: restored.price,
        image: restored.image,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Gagal merestore produk",
      details: [error.message],
    });
  }
};
