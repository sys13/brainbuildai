CREATE TABLE "background_info" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"text_dump" text,
	CONSTRAINT "background_info_prdId_unique" UNIQUE("prd_id")
);
--> statement-breakpoint
ALTER TABLE "background_info" ADD CONSTRAINT "background_info_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "background_info" ADD CONSTRAINT "background_info_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "background_info_tenant_id_id_index" ON "background_info" USING btree ("tenant_id","id");