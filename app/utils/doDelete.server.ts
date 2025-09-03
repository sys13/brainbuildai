import { filterById } from '#app/models/sqlUtils.server'
import { db } from './db.server'
import type { models } from './models'
import { redirectWithToast } from './toast.server'

export async function doDelete({
	model,
	prdId,
	tenantId,
	...props
}: {
	prdId: string
	tenantId: string
} & (
	| { id: string; model: (typeof models)[keyof typeof models] }
	| { model: (typeof models)['prd'] }
)) {
	if (model.name === 'prd') {
		await db
			.delete(model.drizzleSchema)
			.where(filterById({ id: prdId, tenantId }))

		return redirectWithToast('/dashboard', {
			description: `${model.displayNames.singular} deleted`,
			type: 'success',
		})
	}

	const { id } = props as { id: string }
	await db.delete(model.drizzleSchema).where(filterById({ id, tenantId }))

	const redirectURL = model.inProject ? model.listUrl(prdId) : model.listUrl()

	return redirectWithToast(redirectURL, {
		description: `${model.displayNames.singular} deleted`,
		type: 'success',
	})
}
