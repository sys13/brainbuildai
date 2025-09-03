import { eq } from 'drizzle-orm'
import { db } from '#app/utils/db.server'
import type { TenantUser } from '#app/utils/user'
import { tenant } from '#db/schema/base'
import { prd } from '#db/schema/prd'
import type { AllDemoData } from './demo-types'

export async function createDemoSeed<Tags extends string[]>({
	allDemoData,
	tenantUser: { id: ownerId, tenantId },
}: {
	allDemoData: AllDemoData<Tags>
	tenantUser: TenantUser
}) {
	const now = new Date()

	const { projects, tenantName } = allDemoData

	const defaultData = {
		createdAt: now,
		ownerId,
		tenantId,
		updatedAt: now,
		userId: ownerId,
	}

	await db
		.update(tenant)
		.set({ name: tenantName })
		.where(eq(tenant.id, tenantId))

	// project
	for (const project of projects) {
		await db.insert(prd).values({
			...project,
			...defaultData,
		})
	}
}

// function get0OrWithinRange(range: number) {
// 	if (Math.random() < 0.2) {
// 		return 0
// 	} else {
// 		return Math.floor(Math.random() * range)
// 	}
// }
