ALTER TABLE "ticket" ADD COLUMN "is_exported_to_github" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "is_exported_to_jira" boolean DEFAULT false NOT NULL;