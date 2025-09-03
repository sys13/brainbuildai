CREATE TABLE "comment" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"text" text NOT NULL,
	"object_type" text NOT NULL,
	"object_id" text NOT NULL,
	"in_thread" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "comment_tenant_id_id_index" ON "comment" USING btree ("tenant_id","id");--> statement-breakpoint
ALTER TABLE "share" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "share" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "share_email" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "share_email" DROP COLUMN "name";