import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { CreateWidgetBody, UpdateWidgetBody } from "./widget.validation";

export class WidgetService {
  async createWidget(userId: string, data: CreateWidgetBody) {
    const page = await prisma.page.findUnique({
      where: { id: data.pageId },
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

    return prisma.widget.create({
      data: data as any,
    });
  }

  async getWidgetsByPage(pageId: string) {
    return prisma.widget.findMany({
      where: { pageId },
      orderBy: [{ y: "asc" }, { x: "asc" }],
    });
  }

  async updateWidget(userId: string, id: string, data: UpdateWidgetBody) {
    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!widget) {
      throw new AppError(HttpStatus.NOT_FOUND, "Widget not found");
    }

    if (widget.page.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this widget",
      );
    }

    // Grid validation for updates
    const gridColumns = 12; // Default, can be fetched if dynamic
    const newX = data.x ?? widget.x;
    const newWidth = data.width ?? widget.width;

    if (newX + newWidth > gridColumns) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `Widget width exceeds grid limit of ${gridColumns} columns`,
      );
    }

    return prisma.widget.update({
      where: { id },
      data: data as any,
    });
  }

  async deleteWidget(userId: string, id: string) {
    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { page: true },
    });

    if (!widget) {
      throw new AppError(HttpStatus.NOT_FOUND, "Widget not found");
    }

    if (widget.page.userId !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this widget",
      );
    }

    return prisma.widget.delete({
      where: { id },
    });
  }
}
