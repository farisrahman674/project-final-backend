import Joi from "joi";

export const orderSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    "any.required": "Product ID wajib diisi",
    "number.base": "Product ID harus berupa angka",
    "number.positive": "Product ID tidak valid",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity wajib diisi",
    "number.base": "Quantity harus berupa angka",
    "number.min": "Quantity minimal 1",
  }),
});
