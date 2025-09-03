ALTER TABLE "integration_config" ALTER COLUMN "id" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "integration_config" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "integration_config" ADD COLUMN "description" varchar;--> statement-breakpoint
ALTER TABLE "integration_config" ADD COLUMN "name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "integration_config" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;