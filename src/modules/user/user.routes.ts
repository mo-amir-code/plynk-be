import { Router } from "express";
import { UserController } from "./user.controller";
import { protect } from "../../common/middleware/auth.middleware";

const router = Router();

router.get("/me", protect, UserController.getMe);

export default router;
