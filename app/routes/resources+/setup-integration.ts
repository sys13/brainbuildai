import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { data } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { createToastHeaders } from '#app/utils/toast.server.js'
import { integrationConfig } from '#db/schema/integrationConfig'

const schema = z
	.object({
		prdId: z.string(),
		integrationType: z.enum(['github', 'jira']),
		githubToken: z.string().optional(),
		githubRepo: z.string().optional(),
		jiraEmail: z.string().optional(),
		jiraApiToken: z.string().optional(),
		jiraProjectKey: z.string().optional(),
		jiraBaseUrl: z.string().optional(),
	})
	.refine(
		(data) =>
			data.integrationType === 'github'
				? data.githubToken && data.githubRepo
				: data.jiraEmail &&
					data.jiraApiToken &&
					data.jiraProjectKey &&
					data.jiraBaseUrl,
		{
			message: 'Required fields are missing for the selected integration type',
			path: ['integrationType'],
		},
	)

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })
	if (result.status !== 'success') {
		return result.reply()
	}
	const {
		githubToken,
		githubRepo,
		jiraEmail,
		jiraApiToken,
		jiraProjectKey,
		jiraBaseUrl,
		prdId,
	} = result.value
	try {
		await db
			.insert(integrationConfig)
			.values({
				name: '',
				prdId,
				tenantId,
				githubToken,
				githubRepo,
				jiraEmail,
				jiraApiToken,
				jiraProjectKey,
				jiraBaseUrl,
			})
			.onConflictDoUpdate({
				target: [integrationConfig.tenantId, integrationConfig.prdId],
				set: {
					githubToken,
					githubRepo,
					jiraEmail,
					jiraApiToken,
					jiraProjectKey,
					jiraBaseUrl,
				},
			})

		const headers = await createToastHeaders({
			description: 'Setup successfully completed',
			type: 'success',
		})
		return data({ success: true }, { headers })
	} catch (error) {
		console.error('Error inserting setup:', error)
		return data({ errors: ['Invalid inserting setup'] }, { status: 400 })
	}
}
