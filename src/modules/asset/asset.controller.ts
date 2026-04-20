import { Response, NextFunction } from "express";
import { AssetService } from "./asset.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/utils/app-error";
import { AssetCategory } from "../../generated/client/client";

const assetService = new AssetService();

export class AssetController {
  static uploadAsset = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.file) {
        throw new AppError(HttpStatus.BAD_REQUEST, "No file provided");
      }

      const { metadata } = req.body;

      const result = await assetService.uploadAsset(
        req.file,
        req.user!.id,
        req.user!.role,
        AssetCategory.IMAGE,
        metadata ? JSON.parse(metadata) : {},
      );

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Asset uploaded successfully",
        result,
      );
    },
  );

  static uploadSticker = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.file) {
        throw new AppError(HttpStatus.BAD_REQUEST, "No sticker file provided");
      }

      const { metadata } = req.body;

      const result = await assetService.uploadAsset(
        req.file,
        req.user!.id,
        req.user!.role,
        AssetCategory.STICKER,
        metadata ? JSON.parse(metadata) : {},
      );

      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Sticker uploaded successfully",
        result,
      );
    },
  );

  static deleteAsset = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      await assetService.deleteAsset(
        req.params.id as string,
        req.user!.id,
        req.user!.role,
      );
      return sendResponse(
        res,
        HttpStatus.OK,
        "Asset deleted successfully",
        null
      );
    },
  );

  static getMyAssets = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { category } = req.query;
      const result = await assetService.getUserAssets(req.user!.id, category as AssetCategory);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Assets fetched successfully",
        result,
      );
    },
  );

  static getAllAssets = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { category } = req.query;
      const result = await assetService.getAllAssets(category as AssetCategory);
      return sendResponse(
        res,
        HttpStatus.OK,
        "All assets fetched successfully",
        result,
      );
    },
  );

  static getDefaultAssets = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { category } = req.query;
      const result = await assetService.getDefaultAssets(category as AssetCategory);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Default assets fetched successfully",
        result,
      );
    },
  );
}
