import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.validate(req.body, { abortEarly: false });
    if (result.error) {
      const messages = result.error.details.map((d) => d.message);
      res.status(400).json({
        status: "error",
        code: 400,
        message: "Validasi gagal",
        details: messages,
      });
      return;
    }
    next();
  };
};
