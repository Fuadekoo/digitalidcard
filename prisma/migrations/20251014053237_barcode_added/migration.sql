/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `citizen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcode` to the `citizen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "citizen" ADD COLUMN     "barcode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "citizen_barcode_key" ON "citizen"("barcode");
