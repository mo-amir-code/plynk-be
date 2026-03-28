-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "role" "OwnerType" NOT NULL DEFAULT 'USER',
ADD COLUMN     "tnc" BOOLEAN NOT NULL DEFAULT false;
