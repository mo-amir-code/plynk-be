import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";
import prisma from "../../config/prisma";
import { OwnerType } from "../../generated/client/client";
import { HttpStatus } from "../enums/http-status.enum";
import { AUTH_COOKIE_NAME } from "../utils/auth-cookie";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: OwnerType;
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

  if (!token && req.cookies?.[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }

  if (!token) {
    return next(new AppError(HttpStatus.UNAUTHORIZED, "Unauthorized access"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: OwnerType;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true },
    });

    if (!user) {
      return next(
        new AppError(HttpStatus.UNAUTHORIZED, "Account no longer exists"),
      );
    }

    // Since OwnerType is NOT in the user model anymore, we will assume generic USER for now
    // If the user model should have a role, it should be added back toprisma.
    // Given the prompt "do not see the commented part" and the provided "users" model without role,
    // we'll default it or pass it as USER.
    req.user = { id: user.id, role: decoded.role || "USER" };
    next();
  } catch (error) {
    next(new AppError(HttpStatus.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const restrictTo = (...roles: OwnerType[]) => {
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
