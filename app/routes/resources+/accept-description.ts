import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'

export const suggestedDescriptionModels = ['persona'] as const

const schema = z.object({
	id: z.string(),
	modelName: z.enum(suggestedDescriptionModels),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { id, modelName } = result.value
	const drizzleSchema = models[modelName].drizzleSchema

	const suggestedDescription = (
		await db
			.select({ suggestedDescription: drizzleSchema.suggestedDescription })
			.from(drizzleSchema)
			.where(filterById({ id, tenantId }))
			.limit(1)
	)[0].suggestedDescription

	await db
		.update(drizzleSchema)
		.set({ description: suggestedDescription })
		.where(filterById({ id, tenantId }))

	return { result: 'success' }
}
