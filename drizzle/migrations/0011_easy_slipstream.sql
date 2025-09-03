CREATE TABLE "prd_user_interview" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"prd_id" varchar NOT NULL,
	"user_interview_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prd_user_interview" ADD CONSTRAINT "prd_user_interview_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_user_interview" ADD CONSTRAINT "prd_user_interview_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_user_interview" ADD CONSTRAINT "prd_user_interview_user_interview_id_user_interview_id_fk" FOREIGN KEY ("user_interview_id") REFERENCES "public"."user_interview"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "prd_user_interview_tenant_id_id_index" ON "prd_user_interview" USING btree ("tenant_id","id");