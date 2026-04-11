import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validate.middleware";
import { protect } from "../../common/middleware/auth.middleware";
import { authLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../../common/middleware/rate-limit.middleware";
import {
  loginSchema,
  registerSchema,
  checkUsernameSchema,
  claimUsernameSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user account management
 */

const router = Router();

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", protect, AuthController.getMe);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Create a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         $ref: '#/components/responses/AuthSuccess'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.register,
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/AuthSuccess'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Blind success for security
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 message: { type: string, example: "If an account with that email exists, we have sent a reset link." }
 *                 result: { type: object, nullable: true, example: null }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out and clear the auth token cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/check-username/{username}:
 *   get:
 *     summary: Check if a username is available
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAvailable: { type: boolean }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get(
  "/check-username/:username",
  validate(checkUsernameSchema),
  AuthController.checkUsername,
);

/**
 * @swagger
 * /api/v1/auth/claim-username:
 *   patch:
 *     summary: Claim a username
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  "/claim-username",
  protect,
  validate(claimUsernameSchema),
  AuthController.claimUsername,
);

router.get("/google", AuthController.googleAuth);
router.get("/google/callback", AuthController.googleCallback);

export default router;
