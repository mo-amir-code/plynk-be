-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WidgetTypeName" ADD VALUE 'FACEBOOK';
ALTER TYPE "WidgetTypeName" ADD VALUE 'YOUTUBE';
ALTER TYPE "WidgetTypeName" ADD VALUE 'TWITTER';
ALTER TYPE "WidgetTypeName" ADD VALUE 'TIKTOK';
ALTER TYPE "WidgetTypeName" ADD VALUE 'DRIBBBLE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fullName" TEXT;
