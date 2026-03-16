import { Router } from "express";
import { UserController } from "./user.controller";
import { protect } from "../../common/middleware/auth.middleware";

const router = Router();

router.get("/me", protect, UserController.getMe);
router.patch("/me", protect, UserController.updateMe);

export default router;
