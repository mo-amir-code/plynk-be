import { Router } from "express";
import { ThemeController } from "./theme.controller";
import { protect, restrictTo } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { updateThemeSchema } from "./theme.validation";
import { OwnerType } from "../../generated/client/client";

const router = Router();

router.get("/", ThemeController.getAllThemes);
router.patch(
  "/:id",
  protect,
  restrictTo(OwnerType.ADMIN),
  validate(updateThemeSchema),
  ThemeController.updateTheme,
);

export default router;
