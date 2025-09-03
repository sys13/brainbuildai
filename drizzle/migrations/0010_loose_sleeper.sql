CREATE TABLE "design_image" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_link" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exec_summary" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"text_dump" text,
	"website" text,
	CONSTRAINT "exec_summary_prdId_unique" UNIQUE("prd_id")
);
--> statement-breakpoint
CREATE TABLE "risk" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_id" varchar NOT NULL,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "share" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"share_by" text DEFAULT 'none' NOT NULL,
	"share_permission" text DEFAULT 'reader' NOT NULL,
	"share_domain" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "share_email" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"email" text NOT NULL,
	"share_permission" text DEFAULT 'reader' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "story" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_id" varchar NOT NULL,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "success_criteria" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_id" varchar NOT NULL,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "summary" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"text_dump" text,
	"website" text,
	CONSTRAINT "summary_prdId_unique" UNIQUE("prd_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_interview" (
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
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED,
	"customer" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "design_image" ADD CONSTRAINT "design_image_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "design_link" ADD CONSTRAINT "design_link_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "design_link" ADD CONSTRAINT "design_link_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exec_summary" ADD CONSTRAINT "exec_summary_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exec_summary" ADD CONSTRAINT "exec_summary_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "risk" ADD CONSTRAINT "risk_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "risk" ADD CONSTRAINT "risk_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'share_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "share" ADD CONSTRAINT "share_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'share_prd_id_prd_id_fk') THEN
		ALTER TABLE "share" ADD CONSTRAINT "share_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'share_email_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "share_email" ADD CONSTRAINT "share_email_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'share_email_prd_id_prd_id_fk') THEN
		ALTER TABLE "share_email" ADD CONSTRAINT "share_email_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'story_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "story" ADD CONSTRAINT "story_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'story_prd_id_prd_id_fk') THEN
		ALTER TABLE "story" ADD CONSTRAINT "story_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'success_criteria_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "success_criteria" ADD CONSTRAINT "success_criteria_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'success_criteria_prd_id_prd_id_fk') THEN
		ALTER TABLE "success_criteria" ADD CONSTRAINT "success_criteria_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'summary_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "summary" ADD CONSTRAINT "summary_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'summary_prd_id_prd_id_fk') THEN
		ALTER TABLE "summary" ADD CONSTRAINT "summary_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_interview_tenant_id_tenant_id_fk') THEN
		ALTER TABLE "user_interview" ADD CONSTRAINT "user_interview_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;
	END IF;
END$$;

CREATE UNIQUE INDEX "design_image_tenant_id_id_index" ON "design_image" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "design_link_tenant_id_id_index" ON "design_link" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "exec_summary_tenant_id_id_index" ON "exec_summary" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "risk_tenant_id_id_index" ON "risk" USING btree ("tenant_id","id");--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'share_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "share_tenant_id_id_index" ON "share" USING btree ("tenant_id","id");
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'share_email_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "share_email_tenant_id_id_index" ON "share_email" USING btree ("tenant_id","id");
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'story_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "story_tenant_id_id_index" ON "story" USING btree ("tenant_id","id");
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'success_criteria_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "success_criteria_tenant_id_id_index" ON "success_criteria" USING btree ("tenant_id","id");
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'summary_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "summary_tenant_id_id_index" ON "summary" USING btree ("tenant_id","id");
	END IF;
END$$;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_interview_tenant_id_id_index') THEN
		CREATE UNIQUE INDEX "user_interview_tenant_id_id_index" ON "user_interview" USING btree ("tenant_id","id");
	END IF;
END$$;