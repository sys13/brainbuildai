CREATE TABLE "prd_persona" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"persona_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "persona" DROP CONSTRAINT "persona_prd_id_prd_id_fk";
--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "prd_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_persona_id_persona_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."persona"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "prd_persona_tenant_id_id_index" ON "prd_persona" USING btree ("tenant_id","id");--> statement-breakpoint
ALTER TABLE "persona" DROP COLUMN "prd_id";