import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingAndSuggested } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { tenant } from '#db/schema/base.js'
import { success_criteria } from '#db/schema/success_criteria'
import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getAcceptedOrAll } from '../modelUtils'

export default async function getSuccessCriteria({
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
	// check if there are already success_criteria for this project
	const existingSuccessCriteria = await db.query.success_criteria.findMany({
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
		existingSuccessCriteria.length > 0 &&
		existingSuccessCriteria.length > moreSuggestions
	) {
		return existingSuccessCriteria
	}

	if (regenerate) {
		await db
			.delete(success_criteria)
			.where(
				and(
					eq(success_criteria.tenantId, tenantId),
					eq(success_criteria.prdId, prdId),
					eq(success_criteria.isAddedManually, false),
				),
			)
	}

	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [systemPrompt, goals, problems] = await Promise.all([
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { systemPrompt: true },
			})
			.then((d) => d?.systemPrompt ?? ''),
		getAcceptedOrAll(db.query.goal, { tenantId, prdId }),
		getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
	])
	const responses = await getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Respond with only titles and without pleasantries. Provide only the name without any bullet points or punctuation',
		`Here is the project context:
			Tenant description: ${tenant.description ?? ''}
			Project name: ${prd.name}

			Goals: ${goals.join(', ')}
			Problems: ${problems.join(', ')}
			
			${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}

			List 4-5 measurable success criteria that define when this product or feature is successful. Focus on specific, quantifiable outcomes that directly relate to the goals and problems above. Include criteria that cover user behavior, business impact, and product performance where relevant.
			`,
		z.array(z.string()),
		'success_criteria',
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

	const results = await db.insert(success_criteria).values(data).returning({
		createdAt: success_criteria.createdAt,
		id: success_criteria.id,
		isAccepted: success_criteria.isAccepted,
		isAddedManually: success_criteria.isAddedManually,
		isSuggested: success_criteria.isSuggested,
		name: success_criteria.name,
		updatedAt: success_criteria.updatedAt,
	})

	return [...existingSuccessCriteria, ...results]
}
