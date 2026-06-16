import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err.name === "MulterError") {
    const multerErr = err as unknown as { code: string };
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "La imagen supera el tamaño máximo permitido",
      LIMIT_UNEXPECTED_FILE: "Tipo de archivo no esperado",
    };
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: messages[multerErr.code] || "Error al subir el archivo",
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};

export const createError = (statusCode: number, message: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  return error;
};
