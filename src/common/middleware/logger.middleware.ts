import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  if (req.url === "/health" || req.url === "/") {
    return next();
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    const msg = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`;

    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${duration}ms`,
    };

    if (res.statusCode >= 500) {
      logger.error(meta, msg);
    } else if (res.statusCode >= 400) {
      logger.warn(meta, msg);
    } else {
      logger.info(meta, msg);
    }
  });
  next();
};
