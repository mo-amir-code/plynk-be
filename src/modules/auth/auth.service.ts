import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { RegisterBody, LoginBody } from "./auth.validation";
import { OwnerType } from "../../generated/client/client";

export class AuthService {
  private generateToken(id: string, role: OwnerType, username?: string | null): string {
    return jwt.sign({ id, role, username }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }

  async register(data: RegisterBody) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new AppError(
        HttpStatus.CONFLICT,
        "User already exists with this email",
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        tnc: data.tnc,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    const token = this.generateToken(user.id, user.role as OwnerType, user.username);

    return { user: { ...user }, token };
  }

  async login(data: LoginBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const token = this.generateToken(user.id, user.role as OwnerType, user.username);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    };
  }

  async checkUsernameAvailability(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    return !user;
  }

  async claimUsername(userId: string, username: string) {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new AppError(HttpStatus.CONFLICT, "Username is already taken");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    const token = this.generateToken(user.id, "USER" as OwnerType, user.username);

    return { user: { ...user, role: "USER" }, token };
  }
}
