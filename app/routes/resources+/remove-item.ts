import { parseWithZod } from '@conform-to/zod'
import { and } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'
import { createToastHeaders } from '#app/utils/toast.server'

const schema = z.object({
	id: z.string(),
	objType: z.enum([
		'persona',
		'goal',
		'story',
		'risk',
		'problem',
		'success_criteria',
		// 'pain',
		'feature',
		'ticket',
		// 'page',
		// 'step',
		// 'userFlow',
		// 'model',
	]),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { id, objType } = result.value

	const drizzleSchema = models[objType].drizzleSchema
	await db.delete(drizzleSchema).where(and(filterById({ id, tenantId })))

	const headers = await createToastHeaders({
		description: 'Removed',
		type: 'success',
	})
	return new Response(null, { headers: Object.fromEntries(headers.entries()) })
}
