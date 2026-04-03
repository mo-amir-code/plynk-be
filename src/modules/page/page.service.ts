import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { CreatePageBody, UpdatePageBody } from "./page.validation";

export class PageService {
  async createPage(userId: string, data: CreatePageBody) {
    return prisma.page.create({
      data: {
        createdBy: userId,
        title: data.title,
        themeId: data.themeId,
      },
    });
  }

  async getPageByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        page: {
          include: {
            theme: true,
            widgets: true,
          },
        },
      },
    });

    if (!user || !user.page || !user.page.isPublished) {
      throw new AppError(HttpStatus.NOT_FOUND, "Page not found or is currently private");
    }

    const { page } = user;

    return {
      username: user.username,
      title: page.title,
      theme: {
        styleConfig: page.theme?.styleConfig || {},
      },
      widgets: page.widgets.map(w => ({
        id: w.id,
        type: w.type,
        handle: w.handle,
        fullURL: w.fullURL,
        startCol: w.startCol,
        startRow: w.startRow,
        colSize: w.colSize,
        rowSize: w.rowSize,
        config: w.config,
      })),
    };
  }

  async updatePage(userId: string, id: string, data: UpdatePageBody) {
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new AppError(HttpStatus.NOT_FOUND, "Page not found");
    }

    if (page.createdBy !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this page",
      );
    }

    return prisma.page.update({
      where: { id },
      data,
    });
  }

  async deletePage(userId: string, id: string) {
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new AppError(HttpStatus.NOT_FOUND, "Page not found");
    }

    if (page.createdBy !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this page",
      );
    }

    return prisma.page.delete({
      where: { id },
    });
  }

  async getMyPage(userId: string) {
    const page = await prisma.page.findFirst({
      where: { createdBy: userId },
      include: {
        theme: true,
        widgets: true,
      },
    });

    if (!page) {
      return null;
    }

    return page;
  }

  async syncPage(userId: string, data: { themeConfig?: any; widgets?: any[]; isPublished?: boolean }) {
    let page = await prisma.page.findFirst({
      where: { createdBy: userId },
      include: { theme: true },
    });

    if (!page) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.username) {
        throw new AppError(HttpStatus.BAD_REQUEST, "User must have a username to create a page");
      }

      const defaultTheme = await prisma.theme.create({
        data: {
          name: `${user.username}-theme`,
          ownerType: "USER",
          type: "LINKS",
          description: "Default theme",
          styleConfig: {},
          createdBy: userId,
        }
      });

      page = await prisma.page.create({
        data: {
          createdBy: userId,
          title: `${user.username}'s Page`,
          themeId: defaultTheme.id,
        },
        include: { theme: true },
      });
    }

    return await prisma.$transaction(async (tx) => {
      if (data.isPublished !== undefined) {
        await tx.page.update({
          where: { id: page.id },
          data: { isPublished: data.isPublished }
        });
      }

      if (data.themeConfig) {
        await tx.theme.update({
          where: { id: page.themeId },
          data: { styleConfig: data.themeConfig },
        });
      }

      if (data.widgets) {
        await tx.widget.deleteMany({
          where: { pageId: page.id },
        });

        if (data.widgets.length > 0) {
          await tx.widget.createMany({
            data: data.widgets.map((w: any) => ({
              pageId: page.id,
              type: (w.type || "CUSTOM").toUpperCase(),
              handle: w.handle || "",
              fullURL: w.fullURL || "",
              startCol: w.startCol || 0,
              startRow: w.startRow || 0,
              colSize: w.colSize || 1,
              rowSize: w.rowSize || 1,
              config: w.config || {},
            })),
          });
        }
      }

      return tx.page.findUnique({
        where: { id: page.id },
        include: { theme: true, widgets: true },
      });
    });
  }
}
