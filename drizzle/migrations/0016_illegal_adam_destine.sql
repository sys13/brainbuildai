CREATE TABLE "context_file" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"file_url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "context_file" ADD CONSTRAINT "context_file_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "context_file" ADD CONSTRAINT "context_file_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "context_file_tenant_id_id_index" ON "context_file" USING btree ("tenant_id","id");