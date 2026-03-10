import { Request, Response, NextFunction } from "express";
import { healthState } from "../utils/health";
import { HttpStatus } from "../enums/http-status.enum";
import { sendResponse } from "../utils/app-response";

export const readinessGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path === "/health") {
    return next();
  }

  if (!healthState.isReady) {
    return sendResponse(
      res,
      HttpStatus.SERVICE_UNAVAILABLE,
      "System is warming up. Please try again in a few seconds.",
    );
  }

  next();
};
