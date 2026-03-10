import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";
import prisma from "../../config/prisma";
import { UserRole } from "../../generated/client/client";
import { HttpStatus } from "../enums/http-status.enum";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized access"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: UserRole;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return next(
        new AppError(HttpStatus.UNAUTHORIZED, "Account no longer exists"),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(HttpStatus.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          HttpStatus.FORBIDDEN,
          "Access denied. Insufficient permissions",
        ),
      );
    }
    next();
  };
};
