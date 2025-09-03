import { invariantResponse } from '@epic-web/invariant'
import type { LoaderFunctionArgs } from 'react-router'
import { requireInternalUser } from '#app/utils/auth.server'
import { checkProPermission } from '#app/utils/check-pro-permission'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await requireInternalUser(request)

	const { prdId: id } = params
	invariantResponse(id, 'Not found', { status: 404 })
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id,
		user,
	})
	const project = await db.query.prd.findFirst({
		columns: { id: true, name: true },
		where: { id, ...(!isReader ? { tenantId } : {}) },
	})
	invariantResponse(project, 'Not found', { status: 404 })

	return {
		canNewProject: await checkProPermission({
			action: 'prd',
			prdId: project.id,
			user,
		}),
		project,
	}
}
