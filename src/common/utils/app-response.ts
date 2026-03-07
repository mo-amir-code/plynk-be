import { Response } from "express";
import { HttpStatus, HttpMessage } from "../enums/http-status.enum";

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  result: T | null;
}

/**
 * Centralized response utility to send consistent API responses.
 * @param res - Express Response object
 * @param code - Http status code (uses HttpStatus enum)
 * @param message - Optional custom message (defaults to HttpStatus message)
 * @param result - Optional data payload
 */
export const sendResponse = <T>(
  res: Response,
  code: HttpStatus = HttpStatus.OK,
  message?: string,
  result: T | null = null,
) => {
  const response: ApiResponse<T> = {
    success: code < 400,
    code,
    message: message || HttpMessage[code] || "Something went wrong",
    result,
  };

  return res.status(code).json(response);
};
