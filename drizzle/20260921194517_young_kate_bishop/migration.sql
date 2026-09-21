CREATE TABLE "order_event" (
	"id" text PRIMARY KEY,
	"order_id" text NOT NULL,
	"status" "order_status",
	"payment_status" "payment_status",
	"actor_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_event_one_change" CHECK (num_nonnulls("status", "payment_status") = 1)
);
--> statement-breakpoint
CREATE INDEX "orderEvent_orderId_idx" ON "order_event" ("order_id");--> statement-breakpoint
ALTER TABLE "order_event" ADD CONSTRAINT "order_event_order_id_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_event" ADD CONSTRAINT "order_event_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id");