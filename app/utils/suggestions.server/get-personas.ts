import type { PersonasProps } from '#app/components/prd/prd-section.js'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import { getOpenAIStructuredOutputs } from '#app/utils/open-ai-mock'
import type { TenantUser } from '#app/utils/user'
import { persona } from '#db/schema/persona'
import { invariant } from '@epic-web/invariant'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export default async function getPersonas({
	moreSuggestions = 0,
	prdId,
	user,
	regenerate = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	regenerate?: boolean
}): Promise<PersonasProps> {
	const { tenantId, isReader } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true, autoAccept: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')

	// check if there are already personas for this project
	const existingPersonas = await db.query.persona.findMany({
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
		where: { tenantId },
	})
	const existingPrdPersonas = await db.query.prdPersona.findMany({
		where: { tenantId, prdId: prd.id },
	})
	if (
		!regenerate &&
		existingPersonas.length > 0 &&
		existingPersonas.length > moreSuggestions
	) {
		return { personas: existingPersonas, prdPersonas: existingPrdPersonas }
	}
	if (regenerate) {
		await db
			.delete(persona)
			.where(
				and(eq(persona.tenantId, tenantId), eq(persona.isAddedManually, false)),
			)
	}
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
		`Provide a list of 4-5 personas
			Project name: ${prd.name}
			Context: ${context}

						${systemPrompt ? `\nInstructions:\n${systemPrompt}` : ''}
			`,
		z.array(z.string()),
		'personas',
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

	const results = await db.insert(persona).values(data).returning({
		createdAt: persona.createdAt,
		id: persona.id,
		isAccepted: persona.isAccepted,
		isAddedManually: persona.isAddedManually,
		isSuggested: persona.isSuggested,
		name: persona.name,
		updatedAt: persona.updatedAt,
	})

	return {
		personas: [...existingPersonas, ...results],
		prdPersonas: existingPrdPersonas,
	}
}
