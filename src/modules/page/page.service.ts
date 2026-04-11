import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { CreatePageBody, UpdatePageBody, SyncPageBody } from "./page.validation";
import {
  OwnerType,
  Prisma,
  Theme,
  ThemeType,
  Widget,
  WidgetType,
} from "../../generated/client/client";

type SyncPageTx = Pick<typeof prisma, "user" | "page" | "theme" | "widget">;
type SyncWidgetInput = NonNullable<SyncPageBody["widgets"]>[number];

type NormalizedWidgetInput = {
  id?: string;
  type: WidgetType;
  handle: string;
  fullURL: string;
  startCol: number;
  startRow: number;
  colSize: number;
  rowSize: number;
  config: Prisma.InputJsonValue;
};

export class PageService {
  private sortJson(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortJson(item));
    }

    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      return Object.keys(obj)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = this.sortJson(obj[key]);
          return acc;
        }, {});
    }

    return value;
  }

  private isJsonEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(this.sortJson(left)) === JSON.stringify(this.sortJson(right));
  }

  private normalizeWidgetType(type?: string): WidgetType {
    if (!type) {
      return WidgetType.CUSTOM;
    }

    const normalizedType = type.toUpperCase();
    if (Object.values(WidgetType).includes(normalizedType as WidgetType)) {
      return normalizedType as WidgetType;
    }

    throw new AppError(HttpStatus.BAD_REQUEST, `Invalid widget type: ${type}`);
  }

  private normalizeWidgetInput(widget: SyncWidgetInput): NormalizedWidgetInput {
    return {
      id: widget.id,
      type: this.normalizeWidgetType(widget.type),
      handle: widget.handle ?? "",
      fullURL: widget.fullURL ?? "",
      startCol: widget.startCol,
      startRow: widget.startRow,
      colSize: widget.colSize,
      rowSize: widget.rowSize,
      config: (widget.config ?? {}) as Prisma.InputJsonValue,
    };
  }

  private buildWidgetIdentityKey(widget: {
    type: WidgetType;
    handle: string;
    fullURL: string;
  }): string {
    return `${widget.type}|${widget.handle}|${widget.fullURL}`;
  }

  private isWidgetChanged(existing: Widget, incoming: NormalizedWidgetInput): boolean {
    return (
      existing.type !== incoming.type ||
      existing.handle !== incoming.handle ||
      existing.fullURL !== incoming.fullURL ||
      existing.startCol !== incoming.startCol ||
      existing.startRow !== incoming.startRow ||
      existing.colSize !== incoming.colSize ||
      existing.rowSize !== incoming.rowSize ||
      !this.isJsonEqual(existing.config, incoming.config)
    );
  }

  private async resolveTheme(
    tx: SyncPageTx,
    userId: string,
    currentThemeId: string,
    requestedThemeId?: string,
  ) {
    const resolvedThemeId = requestedThemeId ?? currentThemeId;

    const theme = await tx.theme.findUnique({ where: { id: resolvedThemeId } });
    if (!theme) {
      throw new AppError(HttpStatus.NOT_FOUND, "Selected theme not found");
    }

    if (theme.ownerType === OwnerType.USER && theme.createdBy !== userId) {
      throw new AppError(HttpStatus.FORBIDDEN, "You do not have access to this theme");
    }

    return {
      theme,
      resolvedThemeId,
      shouldSwitchTheme: resolvedThemeId !== currentThemeId,
    };
  }

  private async updateThemeConfig(
    tx: SyncPageTx,
    userId: string,
    pageId: string,
    theme: Theme,
    themeConfig: SyncPageBody["themeConfig"],
  ) {
    if (!themeConfig) {
      return { themeId: theme.id, theme };
    }

    const nextStyleConfig = themeConfig as Prisma.InputJsonValue;

    if (theme.ownerType === OwnerType.ADMIN) {
      const clonedTheme = await tx.theme.create({
        data: {
          name: `${theme.name} (Custom)`,
          ownerType: OwnerType.USER,
          type: theme.type,
          description: theme.description,
          styleConfig: theme.styleConfig as Prisma.InputJsonValue,
          createdBy: userId,
        },
      });

      await tx.page.update({
        where: { id: pageId },
        data: { themeId: clonedTheme.id },
      });

      if (this.isJsonEqual(clonedTheme.styleConfig, nextStyleConfig)) {
        return { themeId: clonedTheme.id, theme: clonedTheme };
      }

      const updatedTheme = await tx.theme.update({
        where: { id: clonedTheme.id },
        data: { styleConfig: nextStyleConfig },
      });

      return { themeId: updatedTheme.id, theme: updatedTheme };
    }

    if (theme.createdBy !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "You do not have permission to update this theme",
      );
    }

    if (this.isJsonEqual(theme.styleConfig, nextStyleConfig)) {
      return { themeId: theme.id, theme };
    }

    const updatedTheme = await tx.theme.update({
      where: { id: theme.id },
      data: { styleConfig: nextStyleConfig },
    });

    return { themeId: updatedTheme.id, theme: updatedTheme };
  }

  private async syncWidgetsDiff(
    tx: SyncPageTx,
    pageId: string,
    widgets: SyncPageBody["widgets"],
  ) {
    if (!widgets) {
      return;
    }

    const existingWidgets = await tx.widget.findMany({
      where: { pageId },
      orderBy: { createdAt: "asc" },
    });

    const existingById = new Map(existingWidgets.map((widget) => [widget.id, widget]));
    const existingByIdentity = new Map<string, Widget[]>();

    for (const widget of existingWidgets) {
      const key = this.buildWidgetIdentityKey(widget);
      const bucket = existingByIdentity.get(key) ?? [];
      bucket.push(widget);
      existingByIdentity.set(key, bucket);
    }

    const matchedExistingIds = new Set<string>();
    const widgetsToCreate: Prisma.WidgetCreateManyInput[] = [];
    const widgetsToUpdate: Array<{ id: string; data: Prisma.WidgetUpdateInput }> = [];

    for (const rawWidget of widgets) {
      const widget = this.normalizeWidgetInput(rawWidget);
      let matchedWidget: Widget | undefined;

      if (widget.id) {
        const byId = existingById.get(widget.id);
        if (byId && !matchedExistingIds.has(byId.id)) {
          matchedWidget = byId;
        }
      }

      if (!matchedWidget) {
        const identityKey = this.buildWidgetIdentityKey(widget);
        const candidates = existingByIdentity.get(identityKey) ?? [];
        matchedWidget = candidates.find((candidate) => !matchedExistingIds.has(candidate.id));
      }

      if (!matchedWidget) {
        widgetsToCreate.push({
          pageId,
          type: widget.type,
          handle: widget.handle,
          fullURL: widget.fullURL,
          startCol: widget.startCol,
          startRow: widget.startRow,
          colSize: widget.colSize,
          rowSize: widget.rowSize,
          config: widget.config,
        });
        continue;
      }

      matchedExistingIds.add(matchedWidget.id);

      if (this.isWidgetChanged(matchedWidget, widget)) {
        widgetsToUpdate.push({
          id: matchedWidget.id,
          data: {
            type: widget.type,
            handle: widget.handle,
            fullURL: widget.fullURL,
            startCol: widget.startCol,
            startRow: widget.startRow,
            colSize: widget.colSize,
            rowSize: widget.rowSize,
            config: widget.config,
          },
        });
      }
    }

    const widgetIdsToDelete = existingWidgets
      .filter((widget) => !matchedExistingIds.has(widget.id))
      .map((widget) => widget.id);

    if (widgetIdsToDelete.length > 0) {
      await tx.widget.deleteMany({ where: { id: { in: widgetIdsToDelete } } });
    }

    if (widgetsToCreate.length > 0) {
      await tx.widget.createMany({ data: widgetsToCreate });
    }

    if (widgetsToUpdate.length > 0) {
      await Promise.all(
        widgetsToUpdate.map((widget) =>
          tx.widget.update({
            where: { id: widget.id },
            data: widget.data,
          }),
        ),
      );
    }
  }

  private async getOrCreatePage(tx: SyncPageTx, userId: string) {
    const existingPage = await tx.page.findFirst({
      where: { createdBy: userId },
    });

    if (existingPage) {
      return existingPage;
    }

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || !user.username) {
      throw new AppError(HttpStatus.BAD_REQUEST, "User must have a username to create a page");
    }

    const defaultTheme = await tx.theme.findFirst({
      where: { ownerType: OwnerType.ADMIN },
      orderBy: { createdAt: "asc" },
    });

    if (!defaultTheme) {
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "Standard default theme not found");
    }

    return tx.page.create({
      data: {
        createdBy: userId,
        title: `${user.username}'s Page`,
        themeId: defaultTheme.id,
      },
    });
  }

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
      fullName: user.fullName,
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

  async syncPage(userId: string, data: SyncPageBody) {
    return prisma.$transaction(async (tx) => {
      const page = await this.getOrCreatePage(tx, userId);
      let currentThemeId = page.themeId;

      const pageUpdateData: Prisma.PageUncheckedUpdateInput = {};
      if (data.isPublished !== undefined && data.isPublished !== page.isPublished) {
        pageUpdateData.isPublished = data.isPublished;
      }

      const { theme, resolvedThemeId, shouldSwitchTheme } = await this.resolveTheme(
        tx,
        userId,
        currentThemeId,
        data.themeId,
      );

      let activeTheme = theme;

      if (shouldSwitchTheme) {
        pageUpdateData.themeId = resolvedThemeId;
        currentThemeId = resolvedThemeId;
      }

      if (Object.keys(pageUpdateData).length > 0) {
        await tx.page.update({
          where: { id: page.id },
          data: pageUpdateData,
        });
      }

      if (data.themeConfig) {
        const themeResult = await this.updateThemeConfig(
          tx,
          userId,
          page.id,
          activeTheme,
          data.themeConfig,
        );
        activeTheme = themeResult.theme;
        currentThemeId = themeResult.themeId;
      }

      await this.syncWidgetsDiff(tx, page.id, data.widgets);

      return tx.page.findUnique({
        where: { id: page.id },
        include: { theme: true, widgets: true },
      });
    });
  }
}

