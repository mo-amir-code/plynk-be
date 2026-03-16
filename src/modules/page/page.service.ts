import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { CreatePageBody, UpdatePageBody } from "./page.validation";

export class PageService {
  async createPage(userId: string, data: CreatePageBody) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      throw new AppError(HttpStatus.CONFLICT, "Slug is already taken");
    }

    return prisma.page.create({
      data: {
        userId,
        slug: data.slug,
        title: data.title,
      },
    });
  }

  async getPageBySlug(slug: string) {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        theme: true,
        widgets: true,
      },
    });

    if (!page || !page.isPublished) {
      throw new AppError(HttpStatus.NOT_FOUND, "Page not found or is currently private");
    }

    return {
      slug: page.slug,
      title: page.title,
      theme: {
        styleConfig: page.theme?.styleConfig || {},
      },
      widgets: page.widgets.map(w => ({
        id: w.id,
        type: w.type,
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height,
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

    if (page.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this page",
      );
    }

    if (data.slug) {
      const existingPage = await prisma.page.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });

      if (existingPage) {
        throw new AppError(HttpStatus.CONFLICT, "Slug is already taken");
      }
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

    if (page.userId !== userId) {
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
      where: { userId },
      include: {
        theme: true,
        widgets: true,
      },
    });

    if (!page) {
      // If no page found, we might want to create a default one or return null
      // Let's return null and let the controller handle it
      return null;
    }

    return page;
  }

  async syncPage(userId: string, data: { themeConfig?: any; widgets?: any[]; isPublished?: boolean }) {
    let page = await prisma.page.findFirst({
      where: { userId },
      include: { theme: true },
    });

    if (!page) {
      // Fetch user to get username for slug
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.username) {
        throw new AppError(HttpStatus.BAD_REQUEST, "User must have a username to create a page");
      }

      page = await prisma.page.create({
        data: {
          userId,
          slug: user.username,
          title: `${user.fullName || user.username}'s Page`,
        },
        include: { theme: true },
      });
    }

    return await prisma.$transaction(async (tx) => {
      // 0. Update Page basic info (like isPublished)
      if (data.isPublished !== undefined) {
        await tx.page.update({
          where: { id: page.id },
          data: { isPublished: data.isPublished }
        });
      }

      // 1. Update Theme if provided
      if (data.themeConfig) {
        if (page.themeId) {
          await tx.theme.update({
            where: { id: page.themeId },
            data: { styleConfig: data.themeConfig },
          });
        } else {
          const newTheme = await tx.theme.create({
            data: {
              name: `${page.slug}-theme`,
              styleConfig: data.themeConfig,
            },
          });
          await tx.page.update({
            where: { id: page.id },
            data: { themeId: newTheme.id },
          });
        }
      }

      // 2. Sync Widgets if provided
      if (data.widgets) {
        // Simple approach: delete all and recreate
        // This ensures the order and state match the frontend perfectly
        await tx.widget.deleteMany({
          where: { pageId: page.id },
        });

        if (data.widgets.length > 0) {
          await tx.widget.createMany({
            data: data.widgets.map((w: any) => ({
              pageId: page.id,
              type: w.type.toUpperCase(),
              x: w.x,
              y: w.y,
              width: w.width,
              height: w.height,
              config: w.config,
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
