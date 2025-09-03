import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'
import { createToastHeaders } from '#app/utils/toast.server'

const schema = z.object({
	id: z.string(),
	name: z.string(),
	objType: z.enum(['persona']),
	prdId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { id, name, objType } = result.value

	const drizzleSchema = models[objType].drizzleSchema
	await db
		.delete(drizzleSchema)
		.where(filterById({ id, tenantId }))
		.returning({ id: drizzleSchema.id })

	const headers = await createToastHeaders({
		description: `Deleted: ${name}`,
		type: 'success',
	})
	return new Response(null, { headers: Object.fromEntries(headers.entries()) })
}
