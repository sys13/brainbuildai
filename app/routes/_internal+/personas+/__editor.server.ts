import { filterByTenant } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { model, schema } from './__editor'

const tableSchema = model.drizzleSchema

export const withCols = {
	// userFlows: {
	// 	columns: {},
	// 	with: { userFlow: idAndNameCols },
	// },
} as const

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()

	// const { prdId } = params
	// invariantResponse(prdId, 'Not found', { status: 404 })

	const submission = await parseWithZod(formData, {
		async: true,
		schema: schema.superRefine(async (data, ctx) => {
			if (!data.id) {
				return
			}
			const obj = (
				await db
					.select({ id: tableSchema.id })
					.from(tableSchema)
					.where(filterByTenant({ tenantId }))
					.limit(1)
			)[0]

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!obj) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Not found',
				})
			}
		}),
	})

	if (submission.status !== 'success') {
		return submission.reply()
	}

	const { description = '', id, name } = submission.value

	const newValues = {
		description,
		name,
		// ownerId: userId,
		updatedAt: new Date(),
		// prdId,
	}

	const newId = await db.transaction(async (tx) => {
		const { id: objId } = (
			await tx
				.insert(tableSchema)
				.values({ id, isAccepted: true, tenantId, ...newValues })
				.onConflictDoUpdate({ set: newValues, target: tableSchema.id })
				.returning({ id: tableSchema.id })
		)[0]

		return objId
	})

	return redirectWithToast(model.detailsUrl(newId), {
		description: `${model.displayNames.singular} ${
			newId !== id ? 'created' : 'updated'
		}`,
		type: 'success',
	})
}
