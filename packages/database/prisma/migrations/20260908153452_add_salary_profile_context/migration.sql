/*
  Warnings:

  - Added the required column `livingSituation` to the `SalaryProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalaryProfile" ADD COLUMN     "livingSituation" "LivingSituation" NOT NULL,
ADD COLUMN     "supportsFamily" BOOLEAN NOT NULL DEFAULT false;
