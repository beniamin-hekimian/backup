-- Add payment status for cart vs checked-out orders.
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid');

ALTER TABLE "orders" ADD COLUMN "payment_status" "PaymentStatus";

UPDATE "orders"
SET "payment_status" = CASE
  WHEN "status" IS NULL THEN 'unpaid'::"PaymentStatus"
  ELSE 'paid'::"PaymentStatus"
END;

ALTER TABLE "orders" ALTER COLUMN "payment_status" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'unpaid';

-- Replace the old order status set with the chef workflow statuses.
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'accepted', 'rejected', 'delivered');

ALTER TABLE "orders"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (
    CASE "status"::text
      WHEN 'confirmed' THEN 'accepted'
      WHEN 'shipped' THEN 'accepted'
      WHEN 'cancelled' THEN 'rejected'
      WHEN 'pending' THEN 'pending'
      WHEN 'delivered' THEN 'delivered'
      ELSE NULL
    END
  )::"OrderStatus";

DROP TYPE "OrderStatus_old";

-- Link each order to the chef who owns that order.
ALTER TABLE "orders" ADD COLUMN "chef_id" UUID;

UPDATE "orders" AS o
SET "chef_id" = first_meal."user_id"
FROM (
  SELECT DISTINCT ON (oi."orderId")
    oi."orderId",
    m."user_id"
  FROM "order_items" AS oi
  INNER JOIN "meals" AS m ON m."id" = oi."mealId"
  ORDER BY oi."orderId", oi."id"
) AS first_meal
WHERE o."id" = first_meal."orderId";

CREATE INDEX "orders_chef_id_idx" ON "orders"("chef_id");
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");
CREATE INDEX "orders_status_idx" ON "orders"("status");

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_chef_id_fkey"
  FOREIGN KEY ("chef_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
