import Joi from "joi";

export const transferPointSchema = Joi.object({
  targetUserId: Joi.number().integer().positive().required().messages({
    "any.required": "ID target user wajib diisi",
    "number.base": "ID target harus berupa angka",
  }),
  point: Joi.number().integer().min(1).required().messages({
    "any.required": "Jumlah poin wajib diisi",
    "number.min": "Minimal transfer 1 poin",
  }),
});
