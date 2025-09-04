import { promiseHash } from 'remix-utils/promise'
import { getAll } from '#app/models/sqlUtils.server'
import type { Item } from './misc'
import { models } from './models'
import {
	getHasOneRelations,
	getMTMRelations,
	type HasOneRelations,
	type ManyToManyRelations,
} from './modelUtils'
import type { TenantUser } from './user'

type Model = (typeof models)[keyof typeof models]

type DefaultValuesReturnType<T extends Model> = Record<
	HasOneRelations<T>,
	string[]
> &
	Record<ManyToManyRelations<T>, string[]>

export function getDefaultValuesFromSearchParams<T extends Model>(
	model: T,
	searchParams: URLSearchParams,
): DefaultValuesReturnType<T> {
	const hasOneKeys = getHasOneRelations(model) as unknown as HasOneRelations<
		typeof model
	>[]
	const manyToManyKeys = getMTMRelations(
		model,
	) as unknown as ManyToManyRelations<typeof model>[]
	const manyToManyDefaults = manyToManyKeys.reduce(
		(newObj, key) => {
			newObj[key] =
				searchParams
					.get(`${String(key)}Ids`)
					?.split(',')
					.map(String)
					.filter(String) ?? []
			return newObj
		},
		{} as Record<(typeof manyToManyKeys)[number], string[]>,
	)

	const hasOneDefaults = hasOneKeys.reduce(
		(newObj, key) => {
			// @ts-expect-error: Type assertion is necessary to handle potential null or undefined values returned by searchParams.get().
			newObj[key] =
				searchParams
					.get(`${String(key)}Id`)
					?.split(',')
					.map(String)
					.filter(String) ?? []
			return newObj
		},
		{} as Record<(typeof manyToManyKeys)[number], string[]>,
	)
	// @ts-expect-error: not sure why
	return { ...manyToManyDefaults, ...hasOneDefaults }
}

type RelationObjs<T extends Model> = {
	[key in keyof T['relations']]: { all: Item[] }
}

export async function getAllRelationObjs<T extends Model>(
	model: T,
	user: TenantUser,
): Promise<RelationObjs<T>> {
	const relationModelNames = Object.keys(model.relations) as Model['name'][]

	const objs = Object.fromEntries(
		relationModelNames.map((modelName) => {
			return [
				modelName,
				getAll({
					schemaKey: models[modelName].schemaKey,
					tenantId: user.tenantId,
				}),
			]
		}),
	)

	const resolvedObjs = (await promiseHash(objs)) as Record<
		keyof Model['relations'],
		Item[]
	>

	return Object.fromEntries(
		Object.entries(resolvedObjs).map(([key, value]) => {
			return [key, { all: value }]
		}),
	) as RelationObjs<T>
}
