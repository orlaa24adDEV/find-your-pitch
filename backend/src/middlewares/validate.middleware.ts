import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => e.message).join(", ");
        const err = new Error(message) as any;
        err.statusCode = 400;
        next(err);
      } else {
        next(error);
      }
    }
  };
};
