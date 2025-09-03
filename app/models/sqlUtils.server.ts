import { sql } from 'drizzle-orm'
import { db } from '#app/utils/db.server'
import type { Item } from '#app/utils/misc'
import type { models } from '#app/utils/models'

export function filterByIdAndOwner({
	id,
	ownerId,
	tenantId,
}: {
	id: string
	ownerId: string
	tenantId: string
}) {
	return sql`tenant_id = ${tenantId} AND id = ${id} AND owner_id = ${ownerId}`
}

export function filterByTenant({ tenantId }: { tenantId: string }) {
	return sql`tenant_id = ${tenantId}`
}

export function filterByPRD({
	prdId,
	tenantId,
}: {
	prdId: string
	tenantId: string
}) {
	return sql`tenant_id = ${tenantId} AND prd_id = ${prdId}`
}

export function filterByPRDAccepted({
	prdId,
	tenantId,
}: {
	prdId: string
	tenantId: string
}) {
	return sql`tenant_id = ${tenantId} AND prd_id = ${prdId} AND is_accepted = true`
}

export function filterById({ id, tenantId }: { id: string; tenantId: string }) {
	return sql`tenant_id = ${tenantId} AND id = ${id}`
}

export function filterByOwner({
	tenantId,
	userId,
}: {
	tenantId: string
	userId: string
}) {
	return sql`tenant_id = ${tenantId} AND owner_id = ${userId}`
}

export function keysToTrues(keys: string[]) {
	return keys.reduce(
		(acc, key) => {
			acc[key] = true
			return acc
		},
		{} as Record<string, true>,
	)
}

export async function getAllByTenant({
	schemaKey,
	tenantId,
}: {
	schemaKey: (typeof models)[keyof typeof models]['schemaKey']
	tenantId: string
}): Promise<Item[]> {
	// @ts-expect-error: schemaKey is a key of models
	return db.query[schemaKey].findMany({
		columns: { id: true, name: true },
		where: filterByTenant({ tenantId }),
	})
}

export async function getAll({
	schemaKey,
	tenantId,
}: {
	schemaKey: (typeof models)[keyof typeof models]['schemaKey']
	tenantId: string
}): Promise<Item[]> {
	// @ts-expect-error: schemaKey is a key of models
	return db.query[schemaKey].findMany({
		columns: { id: true, name: true },
		where: filterByTenant({ tenantId }),
	})
}

export async function getAllByModel({
	model,
	tenantId,
}: {
	model: (typeof models)[keyof typeof models]
	tenantId: string
}): Promise<Item[]> {
	// @ts-expect-error: schemaKey is a key of models
	return db.query[model.schemaKey].findMany({
		columns: { id: true, name: true },
		where: filterByTenant({ tenantId }),
	})
}
