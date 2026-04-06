import { Request, Response, NextFunction } from "express";
import { ThemeService } from "./theme.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";
import { OwnerType } from "../../generated/client/client";

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

  static getDefaultThemes = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await themeService.getDefaultThemes();
      return sendResponse(
        res,
        HttpStatus.OK,
        "Default themes fetched successfully",
        result,
      );
    },
  );

  static getUserThemes = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const result = await themeService.getUserThemes(userId);
      return sendResponse(
        res,
        HttpStatus.OK,
        "User themes fetched successfully",
        result,
      );
    },
  );

  static createTheme = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const ownerType =
        req.user!.role === OwnerType.ADMIN ? OwnerType.ADMIN : OwnerType.USER;

      const result = await themeService.createTheme(
        req.body,
        userId,
        ownerType,
      );
      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Theme created successfully",
        result,
      );
    },
  );

  static updateTheme = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === OwnerType.ADMIN;

      const result = await themeService.updateTheme(
        req.params.id as string,
        req.body,
        userId,
        isAdmin,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Theme updated successfully",
        result,
      );
    },
  );

  static deleteTheme = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const userId = req.user!.id;
      const isAdmin = req.user!.role === OwnerType.ADMIN;

      const result = await themeService.deleteTheme(
        req.params.id as string,
        userId,
        isAdmin,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Theme deleted successfully",
        result,
      );
    },
  );
}


