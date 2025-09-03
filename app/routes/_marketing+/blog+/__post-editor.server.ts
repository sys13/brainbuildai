import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { eq } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireSuperAdminUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { redirectWithToast } from '#app/utils/toast.server'
import { post } from '#db/schema/blog/post'
import { model, schema } from './__post-editor'

const tableSchema = model.drizzleSchema

export async function action({ request }: ActionFunctionArgs) {
	await requireSuperAdminUser(request)
	const formData = await request.formData()
	// await validateCSRF(formData, request.headers)

	if (formData.get('intent') === 'remove') {
		// const { prdId } = params
		invariantResponse(false, 'Not found', { status: 404 })
		// return doDelete({ model, tenantId, ...params, prdId })
	}

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
					.where(eq(post.id, data.id))
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
		content,
		id,
		metaDescription,
		metaKeywords,
		metaTitle,
		name,
		publishedAt,
		slug,
		status,
	} = submission.value

	const newValues = {
		content,
		metaDescription,
		metaKeywords,
		metaTitle,
		name,
		publishedAt,
		slug,
		status,
		updatedAt: new Date(),
	}

	const newId = await db.transaction(async (tx) => {
		const { id: objId } = (
			await tx
				.insert(tableSchema)
				.values({ id, ...newValues })
				.onConflictDoUpdate({ set: newValues, target: tableSchema.id })
				.returning({ id: tableSchema.id })
		)[0]

		return objId
	})

	return redirectWithToast(`/blog/${slug}`, {
		description: `Article ${newId !== id ? 'created' : 'updated'}`,
		type: 'success',
	})
}
