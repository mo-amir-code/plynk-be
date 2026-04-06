import { Router } from "express";
import { ThemeController } from "./theme.controller";
import { protect, restrictTo } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createThemeSchema, updateThemeSchema } from "./theme.validation";
import { OwnerType } from "../../generated/client/client";

/**
 * @swagger
 * tags:
 *   name: Themes
 *   description: Theme management and style configurations
 */

const router = Router();

/**
 * @swagger
 * /api/v1/themes:
 *   get:
 *     summary: Get all themes
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: List of themes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { type: array, items: { $ref: '#/components/schemas/Theme' } }
 */
router.get("/", ThemeController.getAllThemes);

/**
 * @swagger
 * /api/v1/themes/default:
 *   get:
 *     summary: Get default themes (Admin created)
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: List of default themes
 */
router.get("/default", ThemeController.getDefaultThemes);

/**
 * @swagger
 * /api/v1/themes/custom:
 *   get:
 *     summary: Get themes created by current user
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user themes
 */
router.get("/custom", protect, ThemeController.getUserThemes);

/**
 * @swagger
 * /api/v1/themes:
 *   post:
 *     summary: Create a new custom theme
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theme'
 *     responses:
 *       201:
 *         description: Theme created
 */
router.post(
  "/",
  protect,
  validate(createThemeSchema),
  ThemeController.createTheme,
);

/**
 * @swagger
 * /api/v1/themes/{id}:
 *   patch:
 *     summary: Update theme (Owner or Admin)
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Theme'
 *     responses:
 *       200:
 *         description: Theme updated
 */
router.patch(
  "/:id",
  protect,
  validate(updateThemeSchema),
  ThemeController.updateTheme,
);

/**
 * @swagger
 * /api/v1/themes/{id}:
 *   delete:
 *     summary: Delete theme (Owner or Admin)
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Theme deleted
 */
router.delete("/:id", protect, ThemeController.deleteTheme);

export default router;

