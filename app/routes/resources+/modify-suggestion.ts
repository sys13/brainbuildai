import { parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server.js'
import { db } from '#app/utils/db.server.js'
import { models } from '#app/utils/models.js'

const objTypes = [
	'persona',
	'prdPersona',
	'goal',
	'story',
	'risk',
	'problem',
	'success_criteria',
	// 'pain',
	'feature',
	'userInterview',
	'prdUserInterview',
	'ticket',
	// 'page',
	// 'model',
	// 'userFlow',
] as const
// Extract model names for type checking
const modelsWithPriority = [
	'persona',
	'userInterview',
	'goal',
	'risk',
	'story',
	'problem',
	'persona',
	'success_criteria',
	'feature',
	'product',
]

const schema = z.object({
	action: z.enum(['accept', 'reject', 'prioritize', 'sync']),
	objId: z.string().optional(),
	objType: z.enum(objTypes),
	priority: z.enum(['medium', 'high']).optional(),
	prdId: z.string().optional(),
	selectedUserInterviewIds: z.string().optional(),
	selectedPersonaIds: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const {
		action,
		objId,
		objType,
		prdId,
		selectedUserInterviewIds,
		selectedPersonaIds,
	} = result.value

	// 👇 Logic for PRD detail page syncing selected user interviews
	if (objType === 'prdUserInterview' && action === 'sync') {
		const selectedIds = JSON.parse(selectedUserInterviewIds ?? '[]') as string[]
		if (!prdId) {
			throw new Error('prdId is required')
		}
		await db.transaction(async (tx) => {
			// 1. Delete existing links for this PRD
			await tx
				.delete(models.prdUserInterview.drizzleSchema)
				.where(
					and(
						eq(models.prdUserInterview.drizzleSchema.prdId, prdId),
						eq(models.prdUserInterview.drizzleSchema.tenantId, user.tenantId),
					),
				)

			// 2. Insert new selected links
			if (selectedIds.length > 0) {
				await tx.insert(models.prdUserInterview.drizzleSchema).values(
					selectedIds.map((userInterviewId) => ({
						tenantId: user.tenantId,
						prdId,
						userInterviewId,
					})),
				)
			}
		})

		return { result: 'success' }
	}
	// Logic for syncing prdPersona relationships
	if (objType === 'prdPersona' && action === 'sync') {
		const selectedPersonaIdParsed = JSON.parse(
			selectedPersonaIds ?? '[]',
		) as string[]

		if (!prdId) {
			throw new Error('prdId is required') // Ensure prdId is provided
		}

		// Sync selected personas for the given PRD
		await db.transaction(async (tx) => {
			// 1. Delete existing persona relations for this PRD
			await tx
				.delete(models.prdPersona.drizzleSchema)
				.where(
					and(
						eq(models.prdPersona.drizzleSchema.prdId, prdId),
						eq(models.prdPersona.drizzleSchema.tenantId, user.tenantId),
					),
				)

			// 2. Insert new selected persona relations
			if (selectedPersonaIdParsed.length > 0) {
				await tx.insert(models.prdPersona.drizzleSchema).values(
					selectedPersonaIdParsed.map((personaId) => ({
						tenantId: user.tenantId,
						prdId,
						personaId,
					})),
				)
			}
		})

		return { result: 'success' }
	}
	const drizzleSchema = models[objType].drizzleSchema
	const shouldUpdatePriority = modelsWithPriority.includes(objType)

	const baseSet: {
		isAccepted?: boolean
		priority?: 'low' | 'medium' | 'high'
	} = {}

	if (['accept', 'reject'].includes(action)) {
		baseSet.isAccepted = action === 'accept'
	}

	if (shouldUpdatePriority) {
		baseSet.priority = result.value.priority ?? 'medium'
	}
	if (objId) {
		await db
			.update(drizzleSchema)
			// @ts-expect-error: object is undefined
			.set(baseSet)
			.where(
				and(
					eq(drizzleSchema.tenantId, user.tenantId),
					eq(drizzleSchema.id, objId),
				),
			)
	}

	return { result: 'success' }
}
