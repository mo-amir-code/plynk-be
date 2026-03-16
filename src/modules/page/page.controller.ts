import { Request, Response, NextFunction } from "express";
import { PageService } from "./page.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const pageService = new PageService();

export class PageController {
  static createPage = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await pageService.createPage(req.user!.id, req.body);
      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Page created successfully",
        result,
      );
    },
  );

  static getPageBySlug = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await pageService.getPageBySlug(req.params.slug as string);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Page fetched successfully",
        result,
      );
    },
  );

  static updatePage = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await pageService.updatePage(
        req.user!.id,
        req.params.id as string,
        req.body,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Page updated successfully",
        result,
      );
    },
  );

  static deletePage = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      await pageService.deletePage(req.user!.id, req.params.id as string);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Page deleted successfully",
        null,
      );
    },
  );
 
  static getMyPage = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await pageService.getMyPage(req.user!.id);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Page fetched successfully",
        result,
      );
    },
  );
 
  static syncPage = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await pageService.syncPage(req.user!.id, req.body);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Page synced successfully",
        result,
      );
    },
  );
}
