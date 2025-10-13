/*
  Warnings:

  - Changed the type of `orderType` on the `order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "orderType" AS ENUM ('URGENT', 'NORMAL');

-- AlterTable
ALTER TABLE "order" DROP COLUMN "orderType",
ADD COLUMN     "orderType" "orderType" NOT NULL;
