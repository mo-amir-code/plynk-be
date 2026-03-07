import { Response, Request, NextFunction } from "express";
import { WidgetService } from "./widget.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const widgetService = new WidgetService();

export class WidgetController {
  static createWidget = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await widgetService.createWidget(req.user!.id, req.body);
      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Widget created successfully",
        result,
      );
    },
  );

  static getWidgetsByPage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await widgetService.getWidgetsByPage(
        req.params.pageId as string,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Widgets fetched successfully",
        result,
      );
    },
  );

  static updateWidget = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await widgetService.updateWidget(
        req.user!.id,
        req.params.id as string,
        req.body,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Widget updated successfully",
        result,
      );
    },
  );

  static deleteWidget = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      await widgetService.deleteWidget(req.user!.id, req.params.id as string);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Widget deleted successfully",
        null,
      );
    },
  );
}
