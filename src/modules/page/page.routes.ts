import { Router } from "express";
import { PageController } from "./page.controller";
import { protect } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { createPageSchema, updatePageSchema, syncPageSchema } from "./page.validation";

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Creator page management and viewing
 */

const router = Router();

/**
 * @swagger
 * /api/v1/page/me:
 *   get:
 *     summary: Get my page
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My page profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 message: { type: string, example: "Page fetched" }
 *                 result: { $ref: '#/components/schemas/Page' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", protect, PageController.getMyPage);

/**
 * @swagger
 * /api/v1/page/sync:
 *   post:
 *     summary: Sync total page state
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               themeId: { type: string }
 *               themeConfig: { $ref: '#/components/schemas/ThemeConfig' }
 *               isPublished: { type: boolean }
 *               widgets: { type: array, items: { $ref: '#/components/schemas/Widget' } }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/sync",
  protect,
  validate(syncPageSchema),
  PageController.syncPage,
);


/**
 * @swagger
 * /api/v1/page/{username}:
 *   get:
 *     summary: Get public page
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { $ref: '#/components/schemas/Page' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:username", PageController.getPageByUsername);

/**
 * @swagger
 * /api/v1/page:
 *   post:
 *     summary: Create page
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Page'
 *     responses:
 *       201:
 *         description: Page created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 201 }
 *                 result: { $ref: '#/components/schemas/Page' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post(
  "/",
  protect,
  validate(createPageSchema),
  PageController.createPage,
);

/**
 * @swagger
 * /api/v1/page/{id}:
 *   patch:
 *     summary: Update page
 *     tags: [Pages]
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
 *             $ref: '#/components/schemas/Page'
 *     responses:
 *       200:
 *         description: Page updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 code: { type: integer, example: 200 }
 *                 result: { $ref: '#/components/schemas/Page' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.patch(
  "/:id",
  protect,
  validate(updatePageSchema),
  PageController.updatePage,
);

/**
 * @swagger
 * /api/v1/page/{id}:
 *   delete:
 *     summary: Delete page
 *     tags: [Pages]
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
router.delete("/:id", protect, PageController.deletePage);

export default router;
