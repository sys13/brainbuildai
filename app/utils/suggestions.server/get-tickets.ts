import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { TenantUser } from '#app/utils/user'
import { ticket } from '#db/schema/ticket'
import { getAcceptedOrAll } from '../modelUtils'
import type {
	ExistingAndSuggestedClient,
	IntegrationConfigClient,
} from '../sort-objs'
import { getIntegrationConfigForPrd } from './integration.server'
export default async function getTickets({
	moreSuggestions = 0,
	prdId,
	user,
	regenerate = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	regenerate?: boolean
}): Promise<{
	tickets: ExistingAndSuggestedClient[]
	integrationConfig: IntegrationConfigClient
}> {
	console.log('getTickets_called')
	const { tenantId, isReader } = await getPermission({ id: prdId, user })

	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true, autoAccept: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})
	invariant(prd, 'Project not found')

	const existingTickets = await db.query.ticket.findMany({
		where: { tenantId, prdId },
	})
	if (
		!regenerate &&
		existingTickets.length > 0 &&
		existingTickets.length > moreSuggestions
	) {
		const integrationConfig = await getIntegrationConfigForPrd({ prdId, user })
		return { tickets: existingTickets, integrationConfig }
	}

	if (regenerate) {
		await db
			.delete(ticket)
			.where(
				and(
					eq(ticket.tenantId, tenantId),
					eq(ticket.prdId, prdId),
					eq(ticket.isAddedManually, false),
				),
			)
	}

	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')

	const [systemPrompt, features, goals, successCriteria, problems] =
		await Promise.all([
			db.query.context
				.findFirst({
					where: { tenantId, prdId },
					columns: { systemPrompt: true },
				})
				.then((d) => d?.systemPrompt ?? ''),
			getAcceptedOrAll(db.query.feature, { tenantId, prdId }),
			getAcceptedOrAll(db.query.goal, { tenantId, prdId }),
			getAcceptedOrAll(db.query.success_criteria, { tenantId, prdId }),
			getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
		])

	const responses = await getOpenAIStructuredOutputs(
		'You are an experienced software project manager. Based on the product context, generate realistic development tickets. Each ticket must have a title and a short description. Return 4–6 items.',
		`Here is the product information:
		Project name: ${prd.name}
		Description: ${tenantData.description ?? 'No additional description'}

		Features: ${features.join(', ')}
		Goals: ${goals.join(', ')}
		Success Criteria: ${successCriteria.join(', ')}
		Problems: ${problems.join(', ')}

		Generate 4-5 actionable dev tickets in the format: 
		[{ "name": "Title", "description": "Short description" }]
		
		${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}
`,
		z.array(z.object({ name: z.string(), description: z.string() })),
		'tickets',
	)

	invariant(responses && responses.length > 0, 'No tickets generated')
	const shouldAutoAccept = prd.autoAccept === true
	const ticketData = responses.map(({ name, description }) => ({
		name,
		description,
		prdId,
		tenantId,
		ownerId: user.id,
		isAddedManually: false,
		isAccepted: shouldAutoAccept,
	}))

	const results = await db.insert(ticket).values(ticketData).returning()
	const integrationConfig = await getIntegrationConfigForPrd({ prdId, user })
	return { tickets: results, integrationConfig }
}
