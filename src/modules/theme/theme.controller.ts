import { Request, Response, NextFunction } from "express";
import { ThemeService } from "./theme.service";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const themeService = new ThemeService();

export class ThemeController {
  static getAllThemes = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await themeService.getAllThemes();
      return sendResponse(
        res,
        HttpStatus.OK,
        "Themes fetched successfully",
        result,
      );
    },
  );

  static updateTheme = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await themeService.updateTheme(
        req.params.id as string,
        req.body,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Theme updated successfully",
        result,
      );
    },
  );
}
