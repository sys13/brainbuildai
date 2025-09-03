import { fakerEN } from '@faker-js/faker'
import type { PgTable } from 'drizzle-orm/pg-core'
import { db } from '#app/utils/db.server'
import type { models } from '#app/utils/models'

export function getCreatedUpdated() {
	const createdAt = fakerEN.date.past()
	const updatedAt = fakerEN.date.between({ from: createdAt, to: new Date() })
	return {
		createdAt,
		updatedAt,
	}
}

export async function getAdminUser({ tenantId }: { tenantId: string }) {
	return await db.query.user.findFirst({
		where: {
			tenantId,
			email: 'daniel.arrizza@gmail.com',
		},
	})
}

export function createRandomPairs<T>(
	array1: T[],
	array2: T[],
	limit = 10,
): [T, T][] {
	const pairPool: [T, T][] = []
	const resultPairs: [T, T][] = []

	// Create a pool of all possible pairs
	// biome-ignore lint/complexity/noForEach: <explanation>
	array1.forEach((item1) => {
		// biome-ignore lint/complexity/noForEach: <explanation>
		array2.forEach((item2) => {
			pairPool.push([item1, item2])
		})
	})

	// Randomly select pairs from the pool
	while (pairPool.length > 0) {
		const pairIndex = Math.floor(Math.random() * pairPool.length)
		const pair = pairPool.splice(pairIndex, 1)[0]

		// Ensure the exact pair isn't already in the result set
		if (!resultPairs.some((p) => p[0] === pair[0] && p[1] === pair[1])) {
			resultPairs.push(pair)
		}

		if (resultPairs.length === limit) {
			break
		}
	}

	return resultPairs
}

export async function getIdsWithLimit(
	table: object,
	limit = 10,
): Promise<string[]> {
	if (!('id' in table) || !table.id) {
		throw new Error('Table does not have an id column')
	}
	const idColumn = table.id

	// @ts-expect-error: so many things
	return (await db.select({ id: idColumn }).from(table).limit(limit)).map(
		// @ts-expect-error: so many things
		(obj: { id: string }) => obj.id,
	)
}

type ModelForRelation = Pick<
	(typeof models)[keyof typeof models],
	'drizzleSchema' | 'idFieldName'
>

export async function seedRelations({
	joinTable,
	leftModel,
	numObjs,
	rightModel,
	tenantId,
}: {
	joinTable: PgTable
	leftModel: ModelForRelation
	numObjs?: number
	rightModel: ModelForRelation
	tenantId: string
}) {
	const leftIds = await getIdsWithLimit(leftModel.drizzleSchema)
	const rightIds = await getIdsWithLimit(rightModel.drizzleSchema)

	const pairs = createRandomPairs(leftIds, rightIds, numObjs)

	const pairObjs = pairs.map(([left, right]) => ({
		[leftModel.idFieldName]: left,
		[rightModel.idFieldName]: right,
		tenantId,
	}))

	await db.insert(joinTable).values(pairObjs)
}

export function getRandomElement<T>(array: T[]): T {
	const randomIndex = Math.floor(Math.random() * array.length)
	return array[randomIndex]
}
