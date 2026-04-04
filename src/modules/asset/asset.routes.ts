import { Router } from "express";
import { AssetController } from "./asset.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createAssetSchema } from "./asset.validation";

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset and file management
 */

const router = Router();

/**
 * @swagger
 * /api/v1/assets:
 *   post:
 *     summary: Create asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       201:
 *         description: Asset created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 201 }
 *                 result: { $ref: '#/components/schemas/Asset' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/",
  protect,
  validate(createAssetSchema),
  AssetController.createAsset,
);

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get my assets
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asset list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { type: array, items: { $ref: '#/components/schemas/Asset' } }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", protect, AssetController.getUserAssets);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   delete:
 *     summary: Delete asset
 *     tags: [Assets]
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
router.delete("/:id", protect, AssetController.deleteAsset);

export default router;
