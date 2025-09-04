import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from '@remix-run/node'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server.js'
import { createGithubIssue } from '#app/utils/github.server.js'
import { createToastHeaders } from '#app/utils/toast.server.js'
import { ticket } from '#db/schema/ticket'

const schema = z.object({
	prdId: z.string(),
	target: z.string(),
})
export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })
	if (result.status !== 'success') {
		return result.reply()
	}
	const { target, prdId } = result.value

	if (!prdId || !target) {
		throw new Error('Invalid input')
	}
	// After parsing and validating prdId, target, tenantId
	const config = await db.query.integrationConfig.findFirst({
		where: { prdId, tenantId },
	})

	if (!config) {
		throw new Error('Integration config not found for this PRD')
	}
	// Get unexported tickets for this PRD
	const tickets = await db
		.select()
		.from(ticket)
		.where(
			and(
				eq(ticket.prdId, prdId),
				eq(ticket.tenantId, tenantId),
				eq(ticket.isAccepted, true),
				eq(
					target === 'github'
						? ticket.isExportedToGithub
						: ticket.isExportedToJira,
					false,
				),
			),
		)

	for (const t of tickets) {
		if (target === 'github') {
			if (!config.githubRepo || !config.githubToken) {
				throw new Error('Missing GitHub repo or token in integration config')
			}
			await createGithubIssue({
				name: t.name,
				description: t.description,
				repo: config.githubRepo,
				token: config.githubToken,
			})
			await db
				.update(ticket)
				.set({ isExportedToGithub: true })
				.where(eq(ticket.id, t.id))
		} else {
			if (
				!config.jiraEmail ||
				!config.jiraApiToken ||
				!config.jiraProjectKey ||
				!config.jiraBaseUrl
			) {
				throw new Error('Missing Jira credentials in integration config')
			}

			await db
				.update(ticket)
				.set({ isExportedToJira: true })
				.where(eq(ticket.id, t.id))
		}
	}
	const headers = await createToastHeaders({
		description: 'Added successfully',
		type: 'success',
	})
	return new Response(null, { headers: Object.fromEntries(headers.entries()) })
}
