ALTER TABLE "user" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "ban_expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;