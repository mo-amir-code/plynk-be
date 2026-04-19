import { Router } from "express";
import multer from "multer";
import { AssetController } from "./asset.controller";
import { protect, restrictTo } from "../../common/middleware/auth.middleware";
import { OwnerType } from "../../generated/client/client";

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Asset management and GCS uploads
 */

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const isAllowed = allowedTypes.test(file.mimetype);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, png, gif, svg, webp) are allowed") as any, false);
    }
  },
});

/**
 * @swagger
 * /api/v1/assets/upload:
 *   post:
 *     summary: Upload a new asset (Admin or User)
 *     tags: [Assets]
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
 *       201:
 *         description: Asset uploaded
 */
router.post("/upload", protect, upload.single("file"), AssetController.uploadAsset);

/**
 * @swagger
 * /api/v1/assets/my-assets:
 *   get:
 *     summary: Get all assets of the current user
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assets
 */
router.get("/user", protect, AssetController.getMyAssets);

/**
 * @swagger
 * /api/v1/assets/default:
 *   get:
 *     summary: Get all default system assets (Admin uploaded)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of system assets
 */
router.get("/default", protect, AssetController.getDefaultAssets);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   delete:
 *     summary: Delete asset (Owner or Admin)
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
 *         description: Asset deleted
 */
router.delete("/:id", protect, AssetController.deleteAsset);

/**
 * @swagger
 * /api/v1/assets/all:
 *   get:
 *     summary: Get all assets from all users (Admin only)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all assets
 */
router.get("/all", protect, restrictTo(OwnerType.ADMIN), AssetController.getAllAssets);

export default router;
