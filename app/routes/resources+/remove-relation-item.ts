import { parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterByTenant } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'
import { createToastHeaders } from '#app/utils/toast.server'

const objTypes = [
	'persona',
	// 'pain',
	// 'feature',
	// 'page',
	// 'step',
	// 'userFlow',
	// 'model',
] as const

const schema = z.object({
	id: z.string(),
	mainModelId: z.string(),
	mainModelName: z.enum(objTypes),
	modelName: z.enum(objTypes),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { id, mainModelId, mainModelName, modelName } = result.value

	const mainModel = models[mainModelName]
	const model = models[modelName]

	// @ts-expect-error - we know this is a valid model name
	const joinTable = mainModel.relations[modelName]
		.relationTableSchema as PgTable

	await db.delete(joinTable).where(
		and(
			// @ts-expect-error - we know this is a valid field name
			eq(joinTable[mainModel.idFieldName], mainModelId),
			// @ts-expect-error - we know this is a valid field name
			eq(joinTable[model.idFieldName], id),
			filterByTenant({ tenantId }),
		),
	)

	const headers = await createToastHeaders({
		description: 'Removed',
		type: 'success',
	})
	return new Response(null, { headers: Object.fromEntries(headers.entries()) })
}
