import { invariant } from '@epic-web/invariant'
import { db } from '#app/utils/db.server'
import type { TenantUser } from '#app/utils/user'
import getPermission from '../get-permission'
export async function getIntegrationConfigForPrd({
	prdId,
	user,
}: {
	prdId: string
	user: TenantUser
}) {
	const { tenantId, isReader } = await getPermission({ id: prdId, user })
	const prd = await db.query.prd.findFirst({
		columns: { id: true, name: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})
	invariant(prd, 'Project not found')
	return db.query.integrationConfig.findFirst({
		where: { prdId, tenantId },
	})
}
