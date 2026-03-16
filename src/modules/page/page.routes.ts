import { Router } from "express";
import { PageController } from "./page.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createPageSchema, updatePageSchema } from "./page.validation";

const router = Router();

router.get("/me", protect, PageController.getMyPage);
router.post("/sync", protect, PageController.syncPage);
router.get("/:slug", PageController.getPageBySlug);
router.post(
  "/",
  protect,
  validate(createPageSchema),
  PageController.createPage,
);
router.patch(
  "/:id",
  protect,
  validate(updatePageSchema),
  PageController.updatePage,
);
router.delete("/:id", protect, PageController.deletePage);

export default router;
