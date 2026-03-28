/*
  Warnings:

  - You are about to drop the column `altText` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `baseThemeId` on the `themes` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `widgets` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `widgets` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `widgets` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `widgets` table. All the data in the column will be lost.
  - You are about to drop the `widget_types` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[createdBy]` on the table `pages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerType` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `pages` table without a default value. This is not possible if the table is not empty.
  - Made the column `themeId` on table `pages` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `ownerType` to the `themes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `themes` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `themes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `colSize` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullURL` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `handle` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rowSize` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startCol` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startRow` to the `widgets` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `widgets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ThemeType" AS ENUM ('SHOP', 'LINKS');

-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('GITHUB', 'LINKEDIN', 'INSTAGRAM', 'PORTFOLIO', 'FACEBOOK', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'DRIBBBLE', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_themeId_fkey";

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_userId_fkey";

-- DropIndex
DROP INDEX "pages_slug_key";

-- DropIndex
DROP INDEX "pages_themeId_key";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "altText",
DROP COLUMN "type",
ADD COLUMN     "ownerType" "OwnerType" NOT NULL,
ALTER COLUMN "uploadedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "slug",
DROP COLUMN "userId",
ADD COLUMN     "createdBy" TEXT NOT NULL,
ALTER COLUMN "themeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "themes" DROP COLUMN "baseThemeId",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "ownerType" "OwnerType" NOT NULL,
ADD COLUMN     "type" "ThemeType" NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "styleConfig" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullName",
DROP COLUMN "role",
ALTER COLUMN "username" SET NOT NULL;

-- AlterTable
ALTER TABLE "widgets" DROP COLUMN "height",
DROP COLUMN "width",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "colSize" INTEGER NOT NULL,
ADD COLUMN     "fullURL" TEXT NOT NULL,
ADD COLUMN     "handle" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "rowSize" INTEGER NOT NULL,
ADD COLUMN     "startCol" INTEGER NOT NULL,
ADD COLUMN     "startRow" INTEGER NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "WidgetType" NOT NULL,
ALTER COLUMN "config" SET DEFAULT '{}';

-- DropTable
DROP TABLE "widget_types";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "WidgetTypeName";

-- CreateIndex
CREATE UNIQUE INDEX "pages_createdBy_key" ON "pages"("createdBy");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
