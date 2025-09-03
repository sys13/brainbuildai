import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { ExistingAndSuggested } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { story } from '#db/schema/story'
import { getAcceptedOrAll } from '../modelUtils'

export default async function getStories({
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

	// check if there are already stories for this project
	const existingStories = await db.query.story.findMany({
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
		existingStories.length > 0 &&
		existingStories.length > moreSuggestions
	) {
		return existingStories
	}

	if (regenerate) {
		await db
			.delete(story)
			.where(
				and(
					eq(story.tenantId, tenantId),
					eq(story.prdId, prdId),
					eq(story.isAddedManually, false),
				),
			)
	}

	const tenantData = await db.query.tenant.findFirst({
		columns: { id: true, description: true },
		where: { id: tenantId },
	})
	invariant(tenantData, 'Tenant not found')
	const [systemPrompt, features, personas] = await Promise.all([
		db.query.context
			.findFirst({
				where: { tenantId, prdId },
				columns: { systemPrompt: true },
			})
			.then((d) => d?.systemPrompt ?? ''),
		getAcceptedOrAll(db.query.feature, { tenantId, prdId }),
		getAcceptedOrAll(db.query.persona, { tenantId }),
	])
	const responses = await getStoriesFromOpenAI({
		prdName: prd.name,
		tenantDescription: tenantData.description,
		features,
		personas,
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

	const results = await db.insert(story).values(data).returning({
		createdAt: story.createdAt,
		id: story.id,
		isAccepted: story.isAccepted,
		isAddedManually: story.isAddedManually,
		isSuggested: story.isSuggested,
		name: story.name,
		updatedAt: story.updatedAt,
	})

	return [...existingStories, ...results]
}

export async function getStoriesFromOpenAI({
	prdName,
	tenantDescription,
	features,
	personas,
	systemPrompt,
}: {
	prdName: string
	tenantDescription: string | null
	features: string[]
	personas: string[]
	systemPrompt: string
}) {
	return getOpenAIStructuredOutputs(
		'You are a helpful product manager for a software company. Respond with only user stories in the format "As a [user], I want to [action] so that [benefit]". Provide 4-5 user stories. No pleasantries, no bullet points, no extra explanation, just the user stories.',
		`Here is the project context:
			Tenant description: ${tenantDescription}
			Project name: ${prdName}

			Features:  ${features.join(', ')}
			Persona: ${personas.join(', ')}
			
			${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}

			List 4-5 clear user stories we should aim for.
			`,
		z.array(z.string()),
		'stories',
	)
}
