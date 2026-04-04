import { Router } from "express";
import { WidgetTypeController } from "./widget-type.controller";

/**
 * @swagger
 * tags:
 *   name: Widget Types
 *   description: Catalog of available widget categories
 */

const router = Router();

/**
 * @swagger
 * /api/v1/widget-types:
 *   get:
 *     summary: Get widget categories
 *     tags: [Widget Types]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { type: array, items: { type: string } }
 */
router.get("/", WidgetTypeController.getAllWidgetTypes);

export default router;
