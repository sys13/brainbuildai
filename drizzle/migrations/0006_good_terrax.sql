ALTER TABLE "job" DROP CONSTRAINT "job_prd_id_prd_id_fk";
--> statement-breakpoint
ALTER TABLE "context" ALTER COLUMN "prd_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "job" DROP COLUMN "prd_id";