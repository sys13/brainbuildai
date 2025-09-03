import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'
import { createToastHeaders } from '#app/utils/toast.server'

const schema = z
	.object({
		name: z.string(),
		objType: z.enum([
			'persona',
			'goal',
			'story',
			'risk',
			'problem',
			'success_criteria',
			'feature',
			'prdPersona',
		]),
		parentObjId: z.string().optional(),
		prdId: z.string().optional(),
	})
	.refine(
		(data) => {
			// require prdId only for 'goal'
			if (
				['goal', 'risk', 'problem', 'success_criteria', 'feature'].includes(
					data.objType,
				)
			) {
				return !!data.prdId
			}
			return true
		},
		{
			message: 'prdId is required',
			path: ['prdId'], // this targets the prdId field for the error
		},
	)

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const {
		name,
		objType,
		// parentObjId,
		prdId,
	} = result.value

	if (objType === 'prdPersona') {
		const drizzleSchema = models.prdPersona.drizzleSchema
		const persona = await db
			.insert(models.persona.drizzleSchema)
			.values({
				isAccepted: true,
				isAddedManually: true,
				name,
				tenantId,
			})
			.returning({ id: drizzleSchema.id })
		if (!prdId) {
			throw new Error('prdId is required to insert a PRD persona relation.')
		}
		await db.insert(models.prdPersona.drizzleSchema).values({
			personaId: persona[0].id,
			prdId,
			tenantId,
		})
	} else {
		const drizzleSchema = models[objType].drizzleSchema
		await db.insert(drizzleSchema).values({
			isAccepted: true,
			isAddedManually: true,
			name,
			tenantId,
			...(prdId ? { prdId } : {}),
		})
	}

	const headers = await createToastHeaders({
		description: `Item added: ${name}`,
		type: 'success',
	})
	return new Response(null, { headers: Object.fromEntries(headers.entries()) })
}
