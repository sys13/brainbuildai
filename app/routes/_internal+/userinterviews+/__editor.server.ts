import { filterByIdAndOwner } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import getUserInterviewAiSummary from '#app/utils/suggestions.server/get-interview-summary.js'
import { redirectWithToast } from '#app/utils/toast.server'
import { prdUserInterview } from '#db/schema/prd_user_interview.js'
import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
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
	const { id: userId, tenantId } = await requireInternalUser(request)
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
					.where(filterByIdAndOwner({ id: data.id, ownerId: userId, tenantId }))
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

	const { description = '', id, name, customer, prdIds } = submission.value

	const summary = await getUserInterviewAiSummary({
		company: name,
		notes: description,
		customer,
	})
	const newValues = {
		description,
		name,
		customer,
		suggestedDescription: summary,
		updatedAt: new Date(),
	}

	const newId = await db.transaction(async (tx) => {
		const { id: objId } = (
			await tx
				.insert(tableSchema)
				.values({ tenantId, ...newValues })
				.onConflictDoUpdate({ set: newValues, target: tableSchema.id })
				.returning({ id: tableSchema.id })
		)[0]
		// Delete existing relations if updating
		if (id) {
			await tx
				.delete(prdUserInterview)
				.where(eq(prdUserInterview.userInterviewId, objId))
		}

		// Insert new relations
		await tx.insert(prdUserInterview).values(
			prdIds.map((prdId) => ({
				tenantId,
				prdId,
				userInterviewId: objId,
			})),
		)

		return objId
	})

	return redirectWithToast(model.detailsUrl(newId), {
		description: `${model.displayNames.singular} ${
			newId !== id ? 'created' : 'updated'
		}`,
		type: 'success',
	})
}
