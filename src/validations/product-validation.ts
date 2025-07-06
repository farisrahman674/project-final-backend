import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama produk tidak boleh kosong",
    "any.required": "Nama produk wajib diisi",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Harga produk harus berupa angka",
    "number.positive": "Harga produk harus lebih dari 0",
    "any.required": "Harga produk wajib diisi",
  }),
});
