import { Request, Response, NextFunction } from "express";
import { WidgetTypeService } from "./widget-type.service";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const widgetTypeService = new WidgetTypeService();

export class WidgetTypeController {
  static getAllWidgetTypes = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await widgetTypeService.getAllWidgetTypes();
      return sendResponse(
        res,
        HttpStatus.OK,
        "Widget types fetched successfully",
        result,
      );
    },
  );
}
