import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { requireInternalUser } from './auth.server'
import { db } from './db.server'
import { invariantResponse } from './misc'
import type { models } from './models'
import { redirectWithToast } from './toast.server'

const schema = z.object({
	intent: z.enum(['remove']),
})

export default async (
	model: (typeof models)[keyof typeof models],
	{ params, request }: ActionFunctionArgs,
) => {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema })
	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { id: objId, prdId } = params

	const id = objId
	invariantResponse(prdId, 'Project Not found', { status: 404 })

	if (model.name === 'prd') {
		await db
			.delete(model.drizzleSchema)
			.where(filterById({ id: prdId, tenantId }))

		return redirectWithToast('/dashboard', {
			description: `${model.displayNames.singular} deleted`,
			type: 'success',
		})
	}

	invariantResponse(id, 'Not found', { status: 404 })

	await db.delete(model.drizzleSchema).where(filterById({ id, tenantId }))

	const redirectURL = model.inProject ? model.listUrl(prdId) : model.listUrl()

	return redirectWithToast(redirectURL, {
		description: `${model.displayNames.singular} deleted`,
		type: 'success',
	})
}
