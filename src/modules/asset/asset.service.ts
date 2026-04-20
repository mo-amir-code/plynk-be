import prisma from "../../config/prisma";
import { uploadToGCS, deleteFromGCS } from "../../common/utils/gcs";
import { OwnerType, AssetCategory } from "../../generated/client/client";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";
import logger from "../../common/logger";

export class AssetService {
  async uploadAsset(
    file: Express.Multer.File, 
    userId: string, 
    role: OwnerType, 
    category: AssetCategory = AssetCategory.IMAGE, 
    metadata: any = {}
  ) {
    if (category === AssetCategory.STICKER && role !== OwnerType.ADMIN) {
      throw new AppError(HttpStatus.FORBIDDEN, "Only admins can upload stickers");
    }

    const folder = role === OwnerType.ADMIN ? "admins" : `users/${userId}`;
    const url = await uploadToGCS(file, folder);

    return prisma.asset.create({
      data: {
        url,
        category,
        metadata: metadata || {},
        ownerType: role,
        uploadedBy: role === OwnerType.ADMIN ? null : userId,
      },
    });
  }

  async deleteAsset(id: string, userId: string, role: OwnerType) {
    const asset = await prisma.asset.findUnique({ where: { id } });

    if (!asset) {
      throw new AppError(HttpStatus.NOT_FOUND, "Asset not found");
    }

    if (role !== OwnerType.ADMIN && asset.uploadedBy !== userId) {
      logger.warn({ assetId: id, userId, role }, "Unauthorized asset delete attempt");
      throw new AppError(HttpStatus.FORBIDDEN, "Unauthorized access to this asset");
    }

    await deleteFromGCS(asset.url);
    
    return prisma.asset.delete({ where: { id } });
  }

  async getUserAssets(userId: string, category?: AssetCategory) {
    return prisma.asset.findMany({
      where: { 
        uploadedBy: userId,
        ...(category && { category })
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllAssets(category?: AssetCategory) {
    return prisma.asset.findMany({
      where: {
        ...(category && { category })
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  async getDefaultAssets(category?: AssetCategory) {
    return prisma.asset.findMany({
      where: { 
        ownerType: OwnerType.ADMIN,
        ...(category && { category })
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
