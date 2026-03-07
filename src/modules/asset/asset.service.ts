import prisma from "../../config/prisma";
import { AppError } from "../../common/utils/app-error";
import { HttpStatus } from "../../common/enums/http-status.enum";

export class AssetService {
  async createAsset(userId: string, data: any) {
    return prisma.asset.create({
      data: {
        ...data,
        uploadedBy: userId,
      },
    });
  }

  async getUserAssets(userId: string) {
    return prisma.asset.findMany({
      where: { uploadedBy: userId },
    });
  }

  async deleteAsset(userId: string, id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new AppError(HttpStatus.NOT_FOUND, "Asset not found");
    }

    if (asset.uploadedBy !== userId) {
      throw new AppError(
        HttpStatus.FORBIDDEN,
        "Unauthorized access to this asset",
      );
    }

    return prisma.asset.delete({
      where: { id },
    });
  }
}
