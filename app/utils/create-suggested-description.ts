import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import type { suggestedDescriptionModels } from '#app/routes/resources+/accept-description'
import { db } from './db.server'
import type { models } from './models'
import { getOpenAIStructuredOutputs } from './open-ai-mock'

export async function createSuggestedDescription({
	id,
	model,
	name,
	prdId,
	tenantId,
}: {
	id: string
	model: (typeof models)[(typeof suggestedDescriptionModels)[number]]
	name: string
	prdId?: string
	tenantId: string
}): Promise<null | string> {
	const drizzleSchema = model.drizzleSchema

	const prd = await db.query.prd.findFirst({
		where: { id: prdId, tenantId },
	})

	const tenantInfo = await db.query.tenant.findFirst({
		where: { id: tenantId },
		columns: { description: true },
	})

	const tenantDescription = tenantInfo?.description ?? null

	const suggestedDescription = await getOpenAIStructuredOutputs(
		`
		Provide a description for a ${name} which is a ${model.name}.
		Provide 2-3 sentences. It should be for internal use, so shouldn't sound like marketing copy.
		Context: ${tenantDescription}
			`,
		`Provide a description for the: ${name}`,
		z.string(),
		'description',
	)

	await db
		.update(drizzleSchema)
		.set({ suggestedDescription })
		.where(filterById({ id, tenantId }))

	return suggestedDescription
}
