/*
  Warnings:

  - The `isPrinted` column on the `order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "isPrinted",
ADD COLUMN     "isPrinted" "status" NOT NULL DEFAULT 'PENDING';
