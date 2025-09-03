import { fakerEN } from '@faker-js/faker'
import { db } from '#app/utils/db.server'
import { prd } from '#db/schema/prd'
import { createUser } from './createUser'

export async function createPrd({
	name,
	ownerId,
	tenantId,
}: {
	name?: string
	ownerId?: string
	tenantId?: string
} = {}) {
	let userId = ownerId
	let tid = tenantId

	if (!ownerId || !tenantId) {
		const { id: newUserId, tenantId: newTenantId } = await createUser()
		userId = userId ?? newUserId
		tid = tid ?? newTenantId
	}
	if (!ownerId || !tenantId) throw new Error('User not found')

	const prdName = name ?? fakerEN.commerce.productName()

	const [inserted] = await db
		.insert(prd)
		.values({
			// @ts-expect-error name can undefined
			name: prdName,
			ownerId: userId,
			tenantId: tid,
		})
		.returning()

	return inserted
}
