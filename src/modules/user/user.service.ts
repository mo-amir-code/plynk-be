import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { sendContactEmail, ContactEmailOptions } from "../../common/utils/mail";
import { uploadToGCS, deleteFromGCS } from "../../common/utils/gcs";

export class UserService {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        profileImage: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    return user;
  }

  async updateMe(userId: string, data: { fullName?: string; username?: string }) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new AppError(HttpStatus.CONFLICT, "Username already taken");
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        profileImage: true,
      },
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    if (user.profileImage) {
      await deleteFromGCS(user.profileImage);
    }

    const folder = `users/${userId}/profile`;
    const profileImage = await uploadToGCS(file, folder);

    return prisma.user.update({
      where: { id: userId },
      data: { profileImage },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        profileImage: true,
      },
    });
  }

  async removeAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, "User not found");
    }

    if (user.profileImage) {
      await deleteFromGCS(user.profileImage);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        profileImage: true,
      },
    });
  }

  async contact(data: ContactEmailOptions) {
    return await sendContactEmail(data);
  }
}
