ALTER TABLE "job" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prd_persona" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "job" CASCADE;--> statement-breakpoint
DROP TABLE "prd_persona" CASCADE;--> statement-breakpoint
ALTER TABLE "persona" ADD COLUMN "prd_id" varchar;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;