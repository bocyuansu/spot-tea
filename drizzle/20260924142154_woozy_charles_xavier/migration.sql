CREATE TABLE "favorite" (
	"user_id" text,
	"product_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_pkey" PRIMARY KEY("user_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_product_id_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE;