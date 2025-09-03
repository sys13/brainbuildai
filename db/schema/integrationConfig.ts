// db/schema/integrationConfig.ts
import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { standardFields } from './base'
import { prdId } from './prd'

export const integrationConfig = pgTable(
	'integration_config',
	{
		...standardFields,
		prdId,
		githubToken: text('github_token'),
		githubRepo: text('github_repo'),
		jiraEmail: text('jira_email'),
		jiraApiToken: text('jira_api_token'),
		jiraProjectKey: text('jira_project_key'),
		jiraBaseUrl: text('jira_base_url'),
	},
	(table) => ({
		uniqueTenantPrd: uniqueIndex('unique_tenant_prd').on(
			table.tenantId,
			table.prdId,
		),
	}),
)
