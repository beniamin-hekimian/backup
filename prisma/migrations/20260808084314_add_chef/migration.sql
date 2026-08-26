-- AlterTable
ALTER TABLE "meals" ALTER COLUMN "mealRequestStatus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "chefRequestStatus" DROP NOT NULL;
