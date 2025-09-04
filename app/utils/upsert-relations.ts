import { and, eq, notInArray } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import { models } from './models'

export async function upsertRelations(
	tenantId: string,
	// biome-ignore lint/suspicious/noExplicitAny: misc
	tx: any,
	relationSchema: PgTable,
	leftModelName: keyof typeof models,
	leftObjId: string,
	rightModelName: keyof typeof models,
	rightIdsList: string[],
) {
	const leftModelKey = models[leftModelName].idFieldName
	const rightModelKey = models[rightModelName].idFieldName

	if (rightIdsList.length) {
		await tx
			.insert(relationSchema)
			.values(
				rightIdsList.map((id) => ({
					[leftModelKey]: leftObjId,
					[rightModelKey]: id,
					tenantId,
				})),
			)
			.onConflictDoNothing()
	}

	await tx.delete(relationSchema).where(
		and(
			// @ts-expect-error: hi there
			eq(relationSchema.tenantId, tenantId),
			// @ts-expect-error: model is not defined
			eq(relationSchema[leftModelKey], leftObjId),
			rightIdsList.length
				? // @ts-expect-error: model is not defined
					notInArray(relationSchema[rightModelKey], rightIdsList)
				: undefined,
		),
	)
}
