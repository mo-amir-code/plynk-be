import { Router } from "express";
import multer from "multer";
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

const storage = multer.memoryStorage();
const imageUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const isAllowed = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname.toLowerCase());
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only standard image formats (jpg, png, webp, svg) are allowed") as any, false);
    }
  },
});

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
 * /api/v1/users/me/avatar:
 *   patch:
 *     summary: Update current user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router.patch("/me/avatar", protect, imageUpload.single("file"), UserController.updateAvatar);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   delete:
 *     summary: Remove current user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 */
router.delete("/me/avatar", protect, UserController.removeAvatar);

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
