ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
-- 舊的 order_status 混了錢的狀態（pending_payment / paid / refunded）。
-- 先把錢的部分搬進 payment_status，再讓 status 只留下貨與流程的意義。
UPDATE "order" SET "payment_status" = 'paid' WHERE "status" = 'paid' AND "payment_status" = 'unpaid';--> statement-breakpoint
UPDATE "order" SET "payment_status" = 'refunded' WHERE "status" = 'refunded';--> statement-breakpoint
-- paid（已付款、還沒出貨）對應到備貨中；refunded 代表這筆已經結束且沒出貨成功，歸為已取消
UPDATE "order" SET "status" = CASE "status"
  WHEN 'pending_payment' THEN 'pending'
  WHEN 'paid' THEN 'processing'
  WHEN 'refunded' THEN 'cancelled'
  ELSE "status"
END;--> statement-breakpoint
DROP TYPE "order_status";--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE "order_status" USING "status"::"order_status";--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DEFAULT 'pending'::"order_status";
