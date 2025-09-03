CREATE TABLE "job" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"job_type" text,
	"prd_id" varchar NOT NULL,
	"data" jsonb
);
--> statement-breakpoint
DROP INDEX "tenant_id";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "prd_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "persona" ALTER COLUMN "prd_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "problem" ALTER COLUMN "prd_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "company_website" varchar;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "job_tenant_id_id_index" ON "job" USING btree ("tenant_id","id");