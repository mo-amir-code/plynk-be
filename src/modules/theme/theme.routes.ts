import { Router } from "express";
import { ThemeController } from "./theme.controller";
import { protect, restrictTo } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { updateThemeSchema } from "./theme.validation";
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
 * /api/v1/themes/{id}:
 *   patch:
 *     summary: Update theme (Admin)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { $ref: '#/components/schemas/Theme' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch(
  "/:id",
  protect,
  restrictTo(OwnerType.ADMIN),
  validate(updateThemeSchema),
  ThemeController.updateTheme,
);

export default router;
