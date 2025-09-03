import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingAndSuggested } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { problem } from '#db/schema/problem'

export default async function getProblems({
	moreSuggestions = 0,
	prdId,
	user,
	regenerate = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	regenerate?: boolean
	autoAccept?: boolean
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
	// check if there are already problems for this project
	const existingProblems = await db.query.problem.findMany({
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
		existingProblems.length > 0 &&
		existingProblems.length > moreSuggestions
	) {
		return existingProblems
	}
	if (regenerate) {
		await db
			.delete(problem)
			.where(
				and(
					eq(problem.tenantId, tenantId),
					eq(problem.prdId, prdId),
					eq(problem.isAddedManually, false),
				),
			)
	}
	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const context = await db.query.context
		.findFirst({
			where: { tenantId, prdId },
			columns: { textDump: true },
		})
		.then((d) => d?.textDump ?? '')
	const systemPrompt = await db.query.context
		.findFirst({
			where: { tenantId, prdId },
			columns: { systemPrompt: true },
		})
		.then((d) => d?.systemPrompt ?? '')
	const responses = await getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Respond with only titles and without pleasantries. Provide only the name without any bullet points or punctuation',
		`Here is the project context:
			${tenantData.description}
			Project name: ${prd.name}

			Context: ${context}
			
			${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}
			List 4-5 realistic product or user problems we should solve.
			`,
		z.array(z.string()),
		'problems',
	)

	invariant(responses && responses.length > 0, 'No responses from OpenAI')
	const shouldAutoAccept = prd.autoAccept === true
	const newProblems = responses.map((name) => ({
		name,
		ownerId: user.id,
		prdId: prd.id,
		tenantId,
		isAccepted: shouldAutoAccept,
		isAddedManually: false,
		isSuggested: true,
	}))

	const results = await db.insert(problem).values(newProblems).returning()

	return [...existingProblems, ...results]
}
