import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingAndSuggested } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { risk } from '#db/schema/risk'
import { getAcceptedOrAll } from '../modelUtils'

export default async function getRisks({
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
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true, autoAccept: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')

	// check if there are already risks for this project
	const existingRisks = await db.query.risk.findMany({
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
		existingRisks.length > 0 &&
		existingRisks.length > moreSuggestions
	) {
		return existingRisks
	}

	if (regenerate) {
		await db
			.delete(risk)
			.where(
				and(
					eq(risk.tenantId, tenantId),
					eq(risk.prdId, prdId),
					eq(risk.isAddedManually, false),
				),
			)
	}
	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [systemPrompt, features, problems] = await Promise.all([
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { systemPrompt: true },
			})
			.then((d) => d?.systemPrompt ?? ''),
		getAcceptedOrAll(db.query.feature, { tenantId, prdId }),
		getAcceptedOrAll(db.query.problem, { tenantId, prdId }),
	])
	const responses = await getRisksFromOpenAI({
		prdName: prd.name,
		tenantDescription: tenantData.description,
		features,
		problems,
		systemPrompt,
	})
	invariant(responses && responses.length > 0, 'No responses from OpenAI')
	const shouldAutoAccept = prd.autoAccept === true
	const data = responses.map((name) => ({
		name,
		ownerId: user.id,
		prdId: prd.id,
		tenantId,
		isAccepted: shouldAutoAccept,
	}))

	const results = await db.insert(risk).values(data).returning({
		createdAt: risk.createdAt,
		id: risk.id,
		isAccepted: risk.isAccepted,
		isAddedManually: risk.isAddedManually,
		isSuggested: risk.isSuggested,
		name: risk.name,
		updatedAt: risk.updatedAt,
	})

	return [...existingRisks, ...results]
}

export async function getRisksFromOpenAI({
	prdName,
	tenantDescription,
	features,
	problems,
	systemPrompt,
}: {
	prdName: string
	tenantDescription: string | null
	features: string[]
	problems: string[]
	systemPrompt: string
}) {
	return getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Respond with only titles and without pleasantries. Provide only the name without any bullet points or punctuation',
		`Here is the project context:
			${tenantDescription}
			Project name: ${prdName}
			
			Features:  ${features.join(', ')}
			Problems: ${problems.join(', ')}
			
			${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}

			List 4-5 potential product risks or challenges we should be aware of.
			`,
		z.array(z.string()),
		'risks',
	)
}
