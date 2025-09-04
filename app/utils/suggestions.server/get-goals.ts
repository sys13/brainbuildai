import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingAndSuggested } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { tenant } from '#db/schema/base.js'
import { goal } from '#db/schema/goal.js'
import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAcceptedOrAll } from '../modelUtils'

export default async function getGoals({
	moreSuggestions = 0,
	prdId,
	user,
	regenerate = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	regenerate?: boolean
}): Promise<ExistingAndSuggested[]> {
	const { tenantId, isReader } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true, autoAccept: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')

	// check if there are already goals for this project
	const existingGoals = await db.query.goal.findMany({
		columns: {
			createdAt: true,
			id: true,
			isAccepted: true,
			isAddedManually: true,
			isSuggested: true,
			name: true,
			priority: true,
			updatedAt: true,
		},
		where: { tenantId, prdId },
	})
	if (
		!regenerate &&
		existingGoals.length > 0 &&
		existingGoals.length > moreSuggestions
	) {
		return existingGoals
	}
	if (regenerate) {
		await db
			.delete(goal)
			.where(
				and(
					eq(goal.tenantId, tenantId),
					eq(goal.prdId, prdId),
					eq(goal.isAddedManually, false),
				),
			)
	}
	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [context, systemPrompt, problems] = await Promise.all([
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { textDump: true },
			})
			.then((d) => d?.textDump ?? ''),
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { systemPrompt: true },
			})
			.then((d) => d?.systemPrompt ?? ''),
		getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
	])
	const responses = await getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Respond with only titles and without pleasantries. Provide only the name without any bullet points or punctuation',
		`Here is the project context:
			Tenant description: ${tenant.description}
			Project name: ${prd.name}

			Context: ${context}
			Problems: ${problems.join(', ')}
			
			${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}
			List 4-5 clear product goals we should aim for.
			`,
		z.array(z.string()),
		'goals',
	)
	invariant(responses && responses.length > 0, 'No responses from OpenAI')
	const shouldAutoAccept = prd.autoAccept === true
	const data = responses.map((name) => ({
		name,
		ownerId: user.id,
		prdId: prd.id,
		tenantId,
		isAccepted: shouldAutoAccept,
	}))

	const results = await db.insert(goal).values(data).returning({
		createdAt: goal.createdAt,
		id: goal.id,
		isAccepted: goal.isAccepted,
		isAddedManually: goal.isAddedManually,
		isSuggested: goal.isSuggested,
		name: goal.name,
		updatedAt: goal.updatedAt,
	})

	return [...existingGoals, ...results]
}
