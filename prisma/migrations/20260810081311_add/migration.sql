/*
  Warnings:

  - You are about to drop the column `location` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "location";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location" TEXT;
