import { Router } from "express";
import { AssetController } from "./asset.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createAssetSchema } from "./asset.validation";

const router = Router();

router.post(
  "/",
  protect,
  validate(createAssetSchema),
  AssetController.createAsset,
);
router.get("/", protect, AssetController.getUserAssets);
router.delete("/:id", protect, AssetController.deleteAsset);

export default router;
