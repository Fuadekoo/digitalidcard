/*
  Warnings:

  - The `isVerified` column on the `citizen` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "citizen" DROP COLUMN "isVerified",
ADD COLUMN     "isVerified" "status" NOT NULL DEFAULT 'PENDING';
