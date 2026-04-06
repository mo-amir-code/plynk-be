import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { OwnerType, ThemeType } from "../../generated/client/client";

export class ThemeService {
  async getAllThemes() {
    return prisma.theme.findMany();
  }

  async getDefaultThemes() {
    return prisma.theme.findMany({
      where: { ownerType: OwnerType.ADMIN },
    });
  }

  async getUserThemes(userId: string) {
    return prisma.theme.findMany({
      where: { createdBy: userId, ownerType: OwnerType.USER },
    });
  }

  async createTheme(data: any, userId: string, ownerType: OwnerType) {
    return prisma.theme.create({
      data: {
        ...data,
        createdBy: userId,
        ownerType,
      },
    });
  }

  async updateTheme(id: string, data: any, userId?: string, isAdmin?: boolean) {
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new AppError(HttpStatus.NOT_FOUND, "Theme not found");
    }

    if (isAdmin) {
      if (theme.ownerType !== OwnerType.ADMIN) {
        throw new AppError(
          HttpStatus.FORBIDDEN,
          "Admins can only update default themes",
        );
      }
    } else {
      if (theme.ownerType !== OwnerType.USER || theme.createdBy !== userId) {
        throw new AppError(
          HttpStatus.FORBIDDEN,
          "You do not have permission to update this theme",
        );
      }
    }

    return prisma.theme.update({
      where: { id },
      data,
    });
  }

  async deleteTheme(id: string, userId: string, isAdmin?: boolean) {
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new AppError(HttpStatus.NOT_FOUND, "Theme not found");
    }

    if (isAdmin) {
      if (theme.ownerType !== OwnerType.ADMIN) {
        throw new AppError(
          HttpStatus.FORBIDDEN,
          "Admins can only delete default themes",
        );
      }
    } else {
      if (theme.ownerType !== OwnerType.USER || theme.createdBy !== userId) {
        throw new AppError(
          HttpStatus.FORBIDDEN,
          "You do not have permission to delete this theme",
        );
      }
    }

    return prisma.theme.delete({
      where: { id },
    });
  }
}
