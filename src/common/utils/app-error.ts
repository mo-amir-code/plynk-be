import { HttpStatus, HttpMessage } from "../enums/http-status.enum";

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    message?: string,
    isOperational = true,
  ) {
    super(message || HttpMessage[statusCode]);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
