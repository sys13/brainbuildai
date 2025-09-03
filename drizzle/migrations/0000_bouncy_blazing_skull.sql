CREATE TABLE "connection" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"providerId" varchar NOT NULL,
	"providerName" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password" (
	"hash" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar PRIMARY KEY NOT NULL,
	"algorithm" varchar NOT NULL,
	"charSet" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"digits" integer NOT NULL,
	"expiresAt" timestamp,
	"internal" boolean DEFAULT false NOT NULL,
	"period" integer NOT NULL,
	"secret" varchar NOT NULL,
	"target" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"what_to_build" varchar
);
--> statement-breakpoint
CREATE TABLE "tenant" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_onboarding" boolean DEFAULT false,
	"hostname" varchar,
	"initial_email" varchar,
	"name" varchar NOT NULL,
	"stripe_customer_id" varchar,
	"tier" varchar,
	"what_to_build" varchar
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"username" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"internal" boolean DEFAULT false,
	"marketing_emails" boolean DEFAULT false,
	"tenant_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content" text NOT NULL,
	"featured_image" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"meta_title" text,
	"published_at" timestamp with time zone,
	"slug" varchar(255) NOT NULL,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"details" jsonb,
	"name" text NOT NULL,
	"prd_id" varchar,
	"tenant_id" varchar,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_id" varchar,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_persona_id" varchar,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"persona_id" varchar,
	"prd_id" varchar,
	"privilege" text NOT NULL,
	"special_principal" text,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "persona" (
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
CREATE TABLE "prd_persona" (
	"id" varchar PRIMARY KEY NOT NULL,
	"persona_id" varchar,
	"prd_id" varchar,
	"tenant_id" varchar
);
--> statement-breakpoint
CREATE TABLE "prd" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"owner_id" varchar NOT NULL,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE "problem" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"is_accepted" boolean,
	"is_added_manually" boolean,
	"is_suggested" boolean DEFAULT true NOT NULL,
	"prd_id" varchar,
	"priority" text,
	"suggested_description" text,
	"vector_text" tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED
);
--> statement-breakpoint
CREATE TABLE "product" (
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
CREATE TABLE "role" (
	"id" varchar PRIMARY KEY NOT NULL,
	"description" varchar,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"internal" boolean
);
--> statement-breakpoint
CREATE TABLE "user_to_role" (
	"role_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	CONSTRAINT "user_to_role_tenant_id_user_id_role_id_pk" PRIMARY KEY("tenant_id","user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_image" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"alt_text" varchar,
	"blob" text NOT NULL,
	"content_type" varchar NOT NULL,
	"user_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_login" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"date" date NOT NULL,
	"num_logins" integer
);
--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "connection" ADD CONSTRAINT "connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password" ADD CONSTRAINT "password_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password" ADD CONSTRAINT "password_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "verification" ADD CONSTRAINT "verification_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "feature" ADD CONSTRAINT "feature_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "feature" ADD CONSTRAINT "feature_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_prd_persona_id_prd_persona_id_fk" FOREIGN KEY ("prd_persona_id") REFERENCES "public"."prd_persona"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_persona_id_persona_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."persona"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_persona_id_persona_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."persona"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd_persona" ADD CONSTRAINT "prd_persona_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd" ADD CONSTRAINT "prd_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "prd" ADD CONSTRAINT "prd_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "problem" ADD CONSTRAINT "problem_prd_id_prd_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_to_role" ADD CONSTRAINT "user_to_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_image" ADD CONSTRAINT "user_image_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_image" ADD CONSTRAINT "user_image_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_login" ADD CONSTRAINT "user_login_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "connection_tenant_id_providerName_providerId_index" ON "connection" USING btree ("tenant_id","providerName","providerId");--> statement-breakpoint
CREATE UNIQUE INDEX "password_tenant_id_user_id_index" ON "password" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "session_tenant_id_user_id_index" ON "session" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_target_type_index" ON "verification" USING btree ("target","type");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_id" ON "tenant" USING btree ("id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_tenantIdKey" ON "user" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_key" ON "user" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "event_tenant_id_id_index" ON "event" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "feature_tenant_id_id_index" ON "feature" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_tenant_id_id_index" ON "job" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_tenant_id_id_index" ON "permission" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "persona_tenant_id_id_index" ON "persona" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "prd_persona_tenant_id_id_index" ON "prd_persona" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "prd_tenant_id_id_index" ON "prd" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "problem_tenant_id_id_index" ON "problem" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_tenant_id_id_index" ON "product" USING btree ("tenant_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_tenant_id_name_index" ON "role" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "user_image_tenant_id_user_id_index" ON "user_image" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_login_tenant_id_id_index" ON "user_login" USING btree ("tenant_id","id");