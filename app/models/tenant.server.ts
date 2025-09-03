import { db } from '#app/utils/db.server'
import type { Tier } from '#app/utils/types'
import type { TenantUser } from '#app/utils/user'
import { tenant } from '#db/schema/base'
import { role, userToRole } from '../../db/schema/role'
import { defaultRoles } from './default-data.server'

export async function createTenant({
	completedOnboarding,
	hostname,
	initialEmail,
	name,
	stripeCustomerId,
	tier,
	whatToBuild,
}: {
	completedOnboarding?: boolean
	hostname?: string
	initialEmail?: string
	name?: string
	stripeCustomerId?: string
	tier?: Tier
	whatToBuild?: string
} = {}) {
	const newName = name ?? new Date().toISOString()

	const tenantId = (
		await db
			.insert(tenant)
			.values({
				completedOnboarding,
				hostname,
				initialEmail,
				name: newName,
				stripeCustomerId,
				tier,
				whatToBuild,
			})
			.returning({ id: tenant.id })
	)[0].id

	await db
		.insert(role)
		.values(defaultRoles.map((name) => ({ internal: true, name, tenantId })))

	return tenantId
}

export async function addBaseDataToNewTenant({
	id: ownerId,
	tenantId,
}: TenantUser) {
	// const now = new Date()

	const roles = await db.query.role.findMany({
		where: { tenantId },
	})

	await db
		.insert(userToRole)
		.values(
			roles.map((role) => ({
				roleId: role.id,
				tenantId,
				userId: ownerId,
			})),
		)
		.onConflictDoNothing()
}
