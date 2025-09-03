import { db } from '#app/utils/db.server'
import { models } from '#app/utils/models'
const tableSchema = models.prd.drizzleSchema
export async function createTestPrd({
	tenantId,
	userId,
}: { tenantId: string; userId: string }) {
	const result = await db
		.insert(tableSchema)
		.values({
			id: `test-prd-id-${crypto.randomUUID()}`,
			name: 'Test PRD',
			tenantId,
			ownerId: userId,
			autoAccept: false,
		})
		.returning({ id: tableSchema.id })
	return result[0].id
}
