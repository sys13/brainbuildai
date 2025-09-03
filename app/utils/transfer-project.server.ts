import { eq, getTableColumns } from 'drizzle-orm'
import type { PgTable, PgTransaction } from 'drizzle-orm/pg-core'
import { filterByPRD } from '#app/models/sqlUtils.server'
import { persona } from '../../db/schema/persona'
// import { models } from './models'
import { prd } from '../../db/schema/prd'
import { db } from './db.server'

const schemasFromModels = [
	persona,
	prd,
	// role,
	// tagSchema,
]
// const schemasFromModels = Object.values(models).map((model) => model.schema)

export function transferProject({
	newTenantId,
	oldTenantId,
	prdId,
	userId,
}: {
	newTenantId: string
	oldTenantId: string
	prdId: string
	userId: string
}) {
	const tenantId = newTenantId

	return db.transaction(async (tx) => {
		await Promise.all(
			schemasFromModels.map((schema) =>
				updateSchema({
					newTenantId,
					oldTenantId,
					prdId,
					schema,
					tx,
					userId,
				}),
			),
		)
		await tx
			.update(prd)
			.set({ ownerId: userId, tenantId })
			.where(eq(prd.id, prdId))
	})
}

function updateSchema({
	newTenantId,
	oldTenantId,
	prdId,
	schema,
	tx,
	userId,
}: {
	newTenantId: string
	oldTenantId: string
	prdId: string
	schema: PgTable
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	tx: PgTransaction<any, any, any>
	userId: string
}) {
	const columns = getTableColumns(schema)

	return tx
		.update(schema)
		.set(
			Object.keys(columns).some((column) => column === 'ownerId')
				? { ownerId: userId, tenantId: newTenantId }
				: { tenantId: newTenantId },
		)
		.where(filterByPRD({ prdId, tenantId: oldTenantId }))
}
