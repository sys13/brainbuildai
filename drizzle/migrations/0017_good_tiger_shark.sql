CREATE TABLE "ticket" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "context_file" ADD COLUMN "text_dump" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_tenant_id_id_index" ON "ticket" USING btree ("tenant_id","id");