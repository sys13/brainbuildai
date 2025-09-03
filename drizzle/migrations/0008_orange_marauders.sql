CREATE TABLE "goal" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
ALTER TABLE "goal" ADD CONSTRAINT "goal_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "goal_tenant_id_id_index" ON "goal" USING btree ("tenant_id","id");