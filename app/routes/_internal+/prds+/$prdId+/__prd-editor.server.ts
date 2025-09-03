import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import pdf from 'pdf-parse/lib/pdf-parse'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { filterByIdAndOwner } from '#app/models/sqlUtils.server'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { doDelete } from '#app/utils/doDelete.server'
import { uploadContextPdf } from '#app/utils/storage.server.js'
import { getContextSummary } from '#app/utils/suggestions.server/get-context-summary.js'
import { redirectWithToast } from '#app/utils/toast.server'
import { context } from '#db/schema/context.js'
import { contextFile } from '#db/schema/contextFile.js'
import { model, schema } from './__prd-editor'

const tableSchema = model.drizzleSchema

export async function action({ params, request }: ActionFunctionArgs) {
	const { id: userId, tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	// await validateCSRF(formData, request.headers)

	if (formData.get('intent') === 'remove') {
		const { prdId } = params
		invariantResponse(prdId, 'Not found', { status: 404 })
		return doDelete({ model, tenantId, ...params, prdId })
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

	const { description = '', id, name } = submission.value
	const initialContext = formData.get('initialContext')?.toString() || ''
	const file = formData.get('file') as File
	const autoAccept = formData.get('autoAccept')
	const parsedAutoAccept = autoAccept === 'true'
	const newValues = {
		description,
		name,
		ownerId: userId,
		updatedAt: new Date(),
		autoAccept: parsedAutoAccept,
	}

	const newId = await db.transaction(async (tx) => {
		const { id: objId } = (
			await tx
				.insert(tableSchema)
				.values({ id, tenantId, ...newValues })
				.onConflictDoUpdate({ set: newValues, target: tableSchema.id })
				.returning({ id: tableSchema.id })
		)[0]
		// Only create context if this is a new PRD and context was provided
		if (!id && initialContext) {
			await tx.insert(context).values({
				prdId: objId,
				textDump: initialContext,
				tenantId,
			})
		}
		// Handle file if uploaded and valid
		if (file && file instanceof File && file.size > 0) {
			const key = await uploadContextPdf(userId, file)
			const fileUrl = `${process.env.STORAGE_PUBLIC_URL}/${key}`

			const buffer = Buffer.from(await file.arrayBuffer())
			let pdfText = (await pdf(buffer)).text.trim()

			// Summarize if too long
			const wordCount = pdfText.split(/\s+/).length
			if (wordCount > 250) {
				const summarized = await getContextSummary({ textDump: pdfText })
				if (summarized) pdfText = summarized
			}

			await tx.insert(contextFile).values({
				tenantId,
				prdId: objId,
				fileUrl,
				name: key,
				description: file.name,
				textDump: pdfText,
			})
		}
		return objId
	})

	return redirectWithToast(id ? model.detailsUrl(newId) : `/prds/${newId}`, {
		description: `${model.displayNames.singular} ${
			newId !== id ? 'created' : 'updated'
		}`,
		type: 'success',
	})
}
