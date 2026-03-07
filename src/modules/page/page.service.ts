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

    if (!page) {
      throw new AppError(HttpStatus.NOT_FOUND, "Page not found");
    }

    return page;
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
}
