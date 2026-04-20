-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('IMAGE', 'STICKER');

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "category" "AssetCategory" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "metadata" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationExpires" TIMESTAMP(3);
