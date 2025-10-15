/*
  Warnings:

  - You are about to alter the column `barcode` on the `citizen` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(12)`.

*/
-- AlterTable
ALTER TABLE "citizen" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "barcode" SET DATA TYPE CHAR(12);

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "isPrinted" BOOLEAN NOT NULL DEFAULT false;
