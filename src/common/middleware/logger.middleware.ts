import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${duration}ms`,
    });
  });
  next();
};
