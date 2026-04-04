import { Router } from "express";
import { WidgetController } from "./widget.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createWidgetSchema, updateWidgetSchema } from "./widget.validation";

/**
 * @swagger
 * tags:
 *   name: Widgets
 *   description: Individual widget management and positioning
 */

const router = Router();

/**
 * @swagger
 * /api/v1/widgets/page/{pageId}:
 *   get:
 *     summary: Get widgets for page
 *     tags: [Widgets]
 *     parameters:
 *       - in: path
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page widgets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { type: array, items: { $ref: '#/components/schemas/Widget' } }
 */
router.get("/page/:pageId", WidgetController.getWidgetsByPage);

/**
 * @swagger
 * /api/v1/widgets:
 *   post:
 *     summary: Create widget
 *     tags: [Widgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Widget'
 *     responses:
 *       201:
 *         description: Widget created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 201 }
 *                 result: { $ref: '#/components/schemas/Widget' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/",
  protect,
  validate(createWidgetSchema),
  WidgetController.createWidget,
);

/**
 * @swagger
 * /api/v1/widgets/{id}:
 *   patch:
 *     summary: Update widget
 *     tags: [Widgets]
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
 *             $ref: '#/components/schemas/Widget'
 *     responses:
 *       200:
 *         description: Widget updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { $ref: '#/components/schemas/Widget' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch(
  "/:id",
  protect,
  validate(updateWidgetSchema),
  WidgetController.updateWidget,
);

/**
 * @swagger
 * /api/v1/widgets/{id}:
 *   delete:
 *     summary: Delete widget
 *     tags: [Widgets]
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
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete("/:id", protect, WidgetController.deleteWidget);

export default router;
