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
import { verifyEmailTemplate } from "../../common/templates/emails/verify-email.template";
import logger from "../../common/logger";

export class AuthService {
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL,
  );

  private generateToken(id: string, role: OwnerType, isVerified: boolean, username?: string | null): string {
    return jwt.sign({ id, role, isVerified, username }, process.env.JWT_SECRET!, {
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

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        tnc: data.tnc,
        verificationCode,
        verificationExpires,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
      },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Plynk verification code",
        html: verifyEmailTemplate(user.fullName || "there", verificationCode),
      });
    } catch (err: any) {
      logger.error(
        { error: err.message, userId: user.id },
        "Verification Email Failure",
      );
    }

    const token = this.generateToken(
      user.id,
      user.role as OwnerType,
      user.isVerified,
      user.username,
    );

    return { user: { ...user }, token };
  }

  async login(data: LoginBody) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // if (!user.isVerified) {
    //   throw new AppError(HttpStatus.FORBIDDEN, "Account not verified");
    // }

    const token = this.generateToken(user.id, user.role as OwnerType, user.isVerified, user.username);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    };
  }

  async resendVerificationCode(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    if (user.isVerified) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Account is already verified");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationExpires },
    });

    await sendEmail({
      to: user.email,
      subject: "Your Plynk verification code",
      html: verifyEmailTemplate(user.fullName || "there", verificationCode),
    });
  }

  async verifyOTP(email: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    if (user.isVerified) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Account is already verified");
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid verification code");
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Verification code has expired");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    const token = this.generateToken(updatedUser.id, updatedUser.role as OwnerType, true, updatedUser.username);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        isVerified: true,
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
        isVerified: true,
      },
    });

    const token = this.generateToken(user.id, "USER" as OwnerType, user.isVerified, user.username);

    return { user: { ...user, role: "USER", isVerified: user.isVerified }, token };
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
            isVerified: true,
          },
        });
      }

      const token = this.generateToken(user.id, user.role as OwnerType, user.isVerified, user.username);
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
