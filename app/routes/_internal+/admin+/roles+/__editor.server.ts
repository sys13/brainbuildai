import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterById } from '#app/models/sqlUtils.server'
import { requireAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { idAndNameCols } from '#app/utils/db-utils.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { model, schema } from './__editor'

const tableSchema = model.drizzleSchema

export const withCols = {
	useCase: { columns: {}, with: { useCase: idAndNameCols } },
} as const

export async function action({ request }: ActionFunctionArgs) {
	const { id: userId, tenantId } = await requireAdminUser(request)
	const formData = await request.formData()

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
					.where(filterById({ id: data.id, tenantId }))
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

	const {
		description = '',
		id,
		name,
		// newTags: newTagsRaw
	} = submission.value

	if (name === 'admin' || name === 'superadmin') {
		return submission.reply()
	}

	const newValues = {
		description,
		name,
		ownerId: userId,
		updatedAt: new Date(),
	}

	const newId = await db.transaction(async (tx) => {
		const { id: objId } = (
			await tx
				.insert(tableSchema)
				.values({ id, tenantId, ...newValues })
				.onConflictDoUpdate({ set: newValues, target: tableSchema.id })
				.returning({ id: tableSchema.id })
		)[0]

		// const newTags = newTagsRaw?.split(',') ?? []
		// let newTagIds: string[] = []
		// if (newTags.length) {
		// 	newTagIds = (
		// 		await db
		// 			.insert(tagSchema)
		// 			.values(newTags.map(name => ({ name, tenantId, ownerId: userId })))
		// 			.returning({ id: tagSchema.id })
		// 	).map(({ id }) => id)
		// }

		// await Promise.all(
		// 	manyToManyKeys.map(async (key) => {
		// 		const relation = model.relations[key]
		// 		const idsKey = `${key}Ids` as const

		// 		const ids =
		// 			'value' in submission && submission.value[idsKey]
		// 				? submission.value[idsKey]
		// 				: []

		// 		await upsertRelations(
		// 			tenantId,
		// 			tx,
		// 			relation.relationTableSchema,
		// 			model.name,
		// 			objId,
		// 			key,
		// 			// key === 'tag' ? [...ids, ...newTagIds] : ids,
		// 			ids,
		// 		)
		// 	}),
		// )

		return objId
	})

	return redirectWithToast(model.detailsUrl(newId), {
		description: `${model.displayNames.singular} ${
			newId !== id ? 'created' : 'updated'
		}`,
		type: 'success',
	})
}
