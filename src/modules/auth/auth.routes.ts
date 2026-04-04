import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validate.middleware";
import { protect } from "../../common/middleware/auth.middleware";
import {
  loginSchema,
  registerSchema,
  checkUsernameSchema,
  claimUsernameSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.get(
  "/check-username/:username",
  validate(checkUsernameSchema),
  AuthController.checkUsername,
);
router.patch(
  "/claim-username",
  protect,
  validate(claimUsernameSchema),
  AuthController.claimUsername,
);

router.get("/google", AuthController.googleAuth);
router.get("/google/callback", AuthController.googleCallback);

export default router;
