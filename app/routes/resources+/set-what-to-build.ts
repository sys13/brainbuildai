import { parseWithZod } from '@conform-to/zod'
import { and, eq } from 'drizzle-orm'
import { type ActionFunctionArgs, redirect } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { prd } from '#db/schema/prd'

const schema = z.object({
	name: z.string(),
	prdId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { name, prdId } = result.value

	await db
		.update(prd)
		.set({ name })
		.where(and(eq(prd.tenantId, user.tenantId), eq(prd.id, prdId)))

	return redirect(`/prds/${prdId}`)
}
