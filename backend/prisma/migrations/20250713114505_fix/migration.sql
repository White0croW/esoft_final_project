/*
  Warnings:

  - You are about to drop the column `time` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the `_BarberToService` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "_BarberToService" DROP CONSTRAINT "_BarberToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_BarberToService" DROP CONSTRAINT "_BarberToService_B_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "time",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- DropTable
DROP TABLE "_BarberToService";

-- CreateTable
CREATE TABLE "barbershop_schedules" (
    "id" SERIAL NOT NULL,
    "barbershopId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openingTime" TEXT NOT NULL,
    "closingTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barbershop_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barber_schedules" (
    "id" SERIAL NOT NULL,
    "barberId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barber_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BarberServices" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BarberServices_AB_unique" ON "_BarberServices"("A", "B");

-- CreateIndex
CREATE INDEX "_BarberServices_B_index" ON "_BarberServices"("B");

-- AddForeignKey
ALTER TABLE "barbershop_schedules" ADD CONSTRAINT "barbershop_schedules_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "barbershops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barber_schedules" ADD CONSTRAINT "barber_schedules_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarberServices" ADD CONSTRAINT "_BarberServices_A_fkey" FOREIGN KEY ("A") REFERENCES "barbers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BarberServices" ADD CONSTRAINT "_BarberServices_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
