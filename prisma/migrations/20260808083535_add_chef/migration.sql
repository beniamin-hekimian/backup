/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `mealRequestStatus` to the `meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chefRequestStatus` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChefRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MealRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('CUSTOMER', 'CHEF', 'ADMIN');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "meals" ADD COLUMN     "mealRequestRejectReason" TEXT,
ADD COLUMN     "mealRequestStatus" "MealRequestStatus" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "chefRequestRejectReason" TEXT,
ADD COLUMN     "chefRequestStatus" "ChefRequestStatus" NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
