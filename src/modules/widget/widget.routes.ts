import { Router } from "express";
import { WidgetController } from "./widget.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createWidgetSchema, updateWidgetSchema } from "./widget.validation";

const router = Router();

router.get("/page/:pageId", WidgetController.getWidgetsByPage);
router.post(
  "/",
  protect,
  validate(createWidgetSchema),
  WidgetController.createWidget,
);
router.patch(
  "/:id",
  protect,
  validate(updateWidgetSchema),
  WidgetController.updateWidget,
);
router.delete("/:id", protect, WidgetController.deleteWidget);

export default router;
