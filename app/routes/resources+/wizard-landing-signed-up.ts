import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, redirect } from 'react-router'
import { z } from 'zod'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'
import { prd } from '#db/schema/prd'

const schema = z.object({
	whatToBuild: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireInternalUser(request)
	const formData = await request.formData()
	const result = parseWithZod(formData, { schema })

	if (result.status !== 'success') {
		return result.reply()
	}

	const { whatToBuild } = result.value

	const [{ id }] = await db
		.insert(prd)
		.values({ name: whatToBuild, ownerId: user.id, tenantId: user.tenantId })
		.returning({ id: prd.id })

	return redirect(`/prds/${id}`)
}
