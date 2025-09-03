ALTER TABLE "ticket" DROP CONSTRAINT "ticket_prd_id_prd_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "is_accepted" boolean;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "is_added_manually" boolean;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "is_suggested" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "priority" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "suggested_description" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;