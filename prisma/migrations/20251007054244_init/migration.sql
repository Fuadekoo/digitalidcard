-- CreateEnum
CREATE TYPE "status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superAdmin', 'superPrinter', 'stationAdmin', 'stationRegistrar', 'stationPrinter', 'developer');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "stationId" TEXT,
    "status" "userStatus" NOT NULL DEFAULT 'INACTIVE',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "afanOromoName" TEXT NOT NULL,
    "amharicName" TEXT NOT NULL,
    "stationAdminName" TEXT NOT NULL,
    "stampPhoto" TEXT,
    "signPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citizen" (
    "id" TEXT NOT NULL,
    "registralNo" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "stationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "placeOfBirth" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "occupation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "orderStatus" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "paymentProof" TEXT,
    "amount" INTEGER NOT NULL,
    "stationId" TEXT NOT NULL,
    "registrarId" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "station_code_key" ON "station"("code");

-- CreateIndex
CREATE UNIQUE INDEX "citizen_registralNo_key" ON "citizen"("registralNo");

-- CreateIndex
CREATE UNIQUE INDEX "order_orderNumber_key" ON "order"("orderNumber");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citizen" ADD CONSTRAINT "citizen_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_registrarId_fkey" FOREIGN KEY ("registrarId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
