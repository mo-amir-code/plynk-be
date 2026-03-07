import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";

export class ThemeService {
  async getAllThemes() {
    return prisma.theme.findMany();
  }

  async updateTheme(id: string, data: any) {
    const theme = await prisma.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new AppError(HttpStatus.NOT_FOUND, "Theme not found");
    }

    return prisma.theme.update({
      where: { id },
      data,
    });
  }
}
