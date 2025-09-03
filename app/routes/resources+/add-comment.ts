import { parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { comment } from '#db/schema/comment'

const schema = z.object({
	objectType: z.string(),
	prdId: z.string(),
	text: z.string(),
	objectId: z.string(),
	inThread: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { objectType, prdId, text, inThread, objectId } = result.value

	await db.insert(comment).values({
		objectType,
		prdId,
		text,
		objectId,
		inThread: inThread === 'true',
		tenantId,
	})

	return { result: 'success' }
}
