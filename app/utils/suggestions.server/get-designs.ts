import { db } from '#app/utils/db.server'
import getPermission from '#app/utils/get-permission.js'
import type { DesignImageClient, DesignLinkClient } from '#app/utils/sort-objs'
import type { TenantUser } from '#app/utils/user'
import { invariant } from '@epic-web/invariant'

export async function getDesigns({
	prdId,
	user,
}: {
	prdId: string
	user: TenantUser
}): Promise<{
	links: DesignLinkClient[]
	images: DesignImageClient[]
}> {
	const { tenantId, isReader } = await getPermission({
		id: prdId,
		user,
	})
	const prd = await db.query.prd.findFirst({
		columns: { id: true },
		where: { id: prdId, ...(!isReader ? { tenantId } : {}) },
	})

	invariant(prd, 'Project not found')

	const [links, images] = await Promise.all([
		db.query.designLink.findMany({
			columns: {
				id: true,
				name: true,
				url: true,
				createdAt: true,
				updatedAt: true,
			},
			where: { prdId, tenantId },
			orderBy: (t) => [t.createdAt],
		}),
		db.query.designImage.findMany({
			columns: {
				id: true,
				imageUrl: true,
				createdAt: true,
				updatedAt: true,
			},
			where: { prdId, tenantId },
			orderBy: (t) => [t.createdAt],
		}),
	])
	return { links, images }
}
