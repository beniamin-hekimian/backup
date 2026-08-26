/*
  Warnings:

  - You are about to drop the column `calories` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `meals` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `profiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "meals_status_idx";

-- DropIndex
DROP INDEX "meals_user_id_status_idx";

-- AlterTable
ALTER TABLE "meals" DROP COLUMN "calories",
DROP COLUMN "ingredients",
DROP COLUMN "quantity",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "city",
DROP COLUMN "country";

-- CreateIndex
CREATE INDEX "meals_user_id_idx" ON "meals"("user_id");
