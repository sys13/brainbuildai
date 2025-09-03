import { parseWithZod } from '@conform-to/zod'
import { eq } from 'drizzle-orm'
import type { ActionFunctionArgs } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { share } from '#db/schema/share'

const schema = z.object({
	action: z.string(),
	prdId: z.string(),
	shareBy: z.enum(['none', 'link', 'domain', 'email']),
	sharePermission: z.enum(['reader', 'commenter', 'editor']).optional(),
	shareDomain: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { prdId, shareBy, sharePermission, shareDomain, action } = result.value

	if (action === 'create') {
		await db.insert(share).values({
			prdId,
			shareBy,
			tenantId,
		})
	} else {
		await db
			.update(share)
			.set({
				shareBy,
				sharePermission,
				shareDomain,
			})
			.where(eq(share.prdId, prdId))
	}

	return { result: 'success' }
}
