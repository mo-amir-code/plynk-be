import { Router } from "express";
import { WidgetTypeController } from "./widget-type.controller";

const router = Router();

router.get("/", WidgetTypeController.getAllWidgetTypes);

export default router;
