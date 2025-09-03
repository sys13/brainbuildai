ALTER TABLE "integration_config" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "integration_config" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "integration_config" ADD COLUMN "prd_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "integration_config" ADD CONSTRAINT "integration_config_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_tenant_prd" ON "integration_config" USING btree ("tenant_id","prd_id");