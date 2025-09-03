import { invariant } from '@epic-web/invariant'
import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import type { ExistingClient } from '#app/utils/sort-objs'
import type { TenantUser } from '#app/utils/user'
export default async function getBackgroundInfo({
	moreSuggestions = 0,
	prdId,
	user,
	force = false,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	force?: boolean
}): Promise<ExistingClient> {
	const { tenantId, isReader, isCommenter, isEditor } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')
	const backgroundInfo = await db.query.backgroundInfo.findFirst({
		where: { tenantId, prdId: prd.id },
		columns: { textDump: true },
	})
	return backgroundInfo || { textDump: '' }
}
