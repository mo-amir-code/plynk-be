import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error";
import { sendResponse } from "../utils/app-response";
import { HttpStatus } from "../enums/http-status.enum";
import logger from "../logger";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: HttpStatus =
    err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  logger.error({
    msg: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err instanceof ZodError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = "Validation Error";
    const errors = err.issues.map((e: any) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    return sendResponse(res, statusCode, message, errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = HttpStatus.CONFLICT;
      message = "Duplicate field value entered";
    } else if (err.code === "P2025") {
      statusCode = HttpStatus.NOT_FOUND;
      message = "Record not found";
    }
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = "Your token has expired. Please log in again.";
  }

  if (err instanceof AppError) {
    return sendResponse(res, err.statusCode, err.message);
  }

  return sendResponse(
    res,
    statusCode,
    process.env.NODE_ENV === "production" ? message : err.message,
  );
};
