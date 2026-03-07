import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { RegisterBody, LoginBody } from "./auth.validation";
import { UserRole } from "@prisma/client";

export class AuthService {
  private generateToken(id: string, role: UserRole): string {
    return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }

  async register(data: RegisterBody) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new AppError(
        HttpStatus.CONFLICT,
        "User already exists with this email or username",
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  async login(data: LoginBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    };
  }
}
