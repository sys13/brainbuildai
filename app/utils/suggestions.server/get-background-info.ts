import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import type { ExistingClient } from '#app/utils/sort-objs'
import type { TenantUser } from '#app/utils/user'
import { invariant } from '@epic-web/invariant'
export default async function getBackgroundInfo({
	prdId,
	user,
}: {
	moreSuggestions?: number
	prdId: string
	user: TenantUser
	force?: boolean
}): Promise<ExistingClient> {
	const { tenantId, isReader } = await getPermission({
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
