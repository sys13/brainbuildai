import type { LoaderFunctionArgs } from 'react-router'
import { requireInternalUser } from '#app/utils/auth.server'
import { db } from '#app/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const { tenantId } = await requireInternalUser(request)

	const rawObj = await db.query.prd.findMany({
		columns: { id: true, name: true },
		where: { tenantId },
	})

	return rawObj
}
