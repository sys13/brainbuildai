CREATE TABLE "integration_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text NOT NULL,
	"github_token" text,
	"github_repo" text,
	"jira_email" text,
	"jira_api_token" text,
	"jira_project_key" text,
	"jira_base_url" text,
	"created_at" timestamp DEFAULT now()
);