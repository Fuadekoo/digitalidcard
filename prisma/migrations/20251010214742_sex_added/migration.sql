/*
  Warnings:

  - Changed the type of `gender` on the `citizen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "citizen" DROP COLUMN "gender",
ADD COLUMN     "gender" "Sex" NOT NULL;
