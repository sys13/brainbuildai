import { count, eq } from 'drizzle-orm'
import { prd } from '#db/schema/prd'
import { db } from './db.server'
import type { TenantUser } from './user'

export const ACTIONS = ['page', 'prd', 'pdf', 'slides'] as const

const MAX_PROJECTS = 1

export async function checkProPermission({
	action,
	// prdId,
	user,
}: {
	action: (typeof ACTIONS)[number]
	prdId: string
	user: TenantUser
}) {
	const userFull = await db.query.tenant.findFirst({
		columns: { tier: true },
		where: { id: user.tenantId },
	})
	const userIsPro = ['enterprise', 'pro'].includes(userFull?.tier ?? '')
	if (userIsPro) {
		return true
	}

	switch (action) {
		case 'pdf':
		case 'slides':
			return false
		case 'prd':
			return (
				(
					await db
						.select({ count: count() })
						.from(prd)
						.where(eq(prd.tenantId, user.tenantId))
				)[0].count < MAX_PROJECTS
			)
	}
}
