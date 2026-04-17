import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { RegisterBody, LoginBody, ForgotPasswordBody, ResetPasswordBody } from "./auth.validation";
import { OwnerType } from "../../generated/client/client";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../../common/utils/email";
import { resetPasswordTemplate } from "../../common/templates/emails/reset-password.template";
import logger from "../../common/logger";

export class AuthService {
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL,
  );

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

  getGoogleAuthUrl() {
    return this.googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["email", "profile", "openid"],
    });
  }

  async handleGoogleCallback(code: string) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError(HttpStatus.UNAUTHORIZED, "Failed to get user from Google");
      }

      const { email, name } = payload;

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const randomPassword = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(randomPassword, 12);

        user = await prisma.user.create({
          data: {
            email,
            fullName: name || "Google User",
            passwordHash,
            tnc: true,
          },
        });
      }

      const token = this.generateToken(user.id, user.role as OwnerType, user.username);
      return { user, token };
    } catch (err: any) {
      logger.error({ error: err.message }, "Google Auth Callback Failure");
      throw new AppError(
        err.statusCode || HttpStatus.UNAUTHORIZED,
        err.message || "Google Authentication failed",
      );
    }
  }

  async forgotPassword(data: ForgotPasswordBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Plynk password",
        html: resetPasswordTemplate(user.fullName || "there", resetUrl),
      });
    } catch (err: any) {
      logger.error({ error: err.message, userId: user.id }, "Forgot Password Email Service Failure");
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send reset email");
    }
  }

  async resetPassword(data: ResetPasswordBody) {
    const hashedToken = crypto.createHash("sha256").update(data.token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Token is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }
}
