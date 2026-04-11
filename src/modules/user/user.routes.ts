import { Router } from "express";
import { UserController } from "./user.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { contactFormSchema } from "./user.validation";
import { contactLimiter } from "../../common/middleware/rate-limit.middleware";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and settings
 */

const router = Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 message: { type: string, example: "Profile fetched" }
 *                 result: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", protect, UserController.getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 message: { type: string, example: "Profile updated" }
 *                 result: { $ref: '#/components/schemas/User' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch("/me", protect, UserController.updateMe);

/**
 * @swagger
 * /api/v1/users/contact:
 *   post:
 *     summary: Send a contact form message
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               fullName: { type: string, example: "John Doe" }
 *               email: { type: string, example: "john@example.com" }
 *               subject: { type: string, example: "Inquiry" }
 *               message: { type: string, example: "Hello, I have a question." }
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/contact",
  contactLimiter,
  validate(contactFormSchema),
  UserController.contact,
);

export default router;
