import { Response, NextFunction } from "express";
import { AssetService } from "./asset.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const assetService = new AssetService();

export class AssetController {
  static createAsset = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await assetService.createAsset(req.user!.id, req.body);
      return sendResponse(
        res,
        HttpStatus.CREATED,
        "Asset uploaded successfully",
        result,
      );
    },
  );

  static getUserAssets = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await assetService.getUserAssets(req.user!.id);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Assets fetched successfully",
        result,
      );
    },
  );

  static deleteAsset = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      await assetService.deleteAsset(req.user!.id, req.params.id as string);
      return sendResponse(
        res,
        HttpStatus.OK,
        "Asset deleted successfully",
        null,
      );
    },
  );
}
