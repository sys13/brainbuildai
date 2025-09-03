import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { shareEmail } from '#db/schema/shareEmail'

const schema = z.object({
	action: z.string(),
	prdId: z.string(),
	sharePermission: z.enum(['reader', 'commenter', 'editor']).optional(),
	email: z.string().email().optional(),
	emailId: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const {
		prdId,
		sharePermission,
		email = '',
		action,
		emailId = '',
	} = result.value

	switch (action) {
		case 'create':
			await db.insert(shareEmail).values({
				prdId,
				tenantId,
				email,
			})
			break
		case 'update':
			await db
				.update(shareEmail)
				.set({
					sharePermission,
				})
				.where(eq(shareEmail.id, emailId))
			break
		case 'delete':
			await db.delete(shareEmail).where(eq(shareEmail.id, emailId))
			break
	}

	return { result: 'success' }
}
