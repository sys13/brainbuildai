import type { IconName } from '#app/components/ui/icon'
import type { PgTable } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import type { db } from './db.server'
import type { modelNames } from './modelNames'
import type { models } from './models'
import parseIdsArray from './parseIdsArray'
import { getModelUrls } from './url-utils'

const nameMinLength = 1
const nameMaxLength = 1000
const descriptionMinLength = 1
const descriptionMaxLength = 10000

export const schemas = {
	description: z
		.string()
		.min(descriptionMinLength)
		.max(descriptionMaxLength)
		.optional(),
	id: z.string().optional(),
	name: z.string().min(nameMinLength).max(nameMaxLength),
	// newTags: z.string().optional(),
}

export const ticketSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	prdId: z.string().min(1),
	id: z.string().optional(),
})

export const userInterviewSchema = {
	id: z.string().optional(), // used for editing
	name: z.string().min(1, 'Company name is required'),
	description: z.string().min(1, 'Notes are required'),
	customer: z.string().min(1, 'Customer name is required'),
	suggestedDescription: z.string().optional(), // usually auto-generated
	prdIds: z
		.string()
		.transform((val) => val.split(',').filter(Boolean))
		.refine((arr) => arr.length > 0, 'Select at least one PRD'),
}

export const marketingFieldsSchema = z.object({
	marketingDescription: z.string().optional(),
	marketingTitle: z.string().optional(),
})

export const DATE = z.string().transform((val: string) => {
	const date = new Date(val)
	if (Number.isNaN(date.getTime())) {
		throw new Error('Invalid date string')
	}

	return date
})

export const OPTIONAL_DATE = z
	.string()
	.optional()
	.transform((val?: string) => {
		if (!val) {
			return undefined
		}
		const date = new Date(val)
		if (Number.isNaN(date.getTime())) {
			throw new Error('Invalid date string')
		}

		return date
	})

export const idList = z
	.array(z.string())
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	.transform((val) => parseIdsArray(val) ?? [])
	.optional()

type ModelName = (typeof modelNames)[number]

export type GenRelationsProps =
	| { cardinality: 'hasMany' | 'hasOne' }
	| {
			cardinality: 'manyToMany'
			relationTableSchema: PgTable
	  }

export type Model<T extends (typeof modelNames)[number]> = {
	displayNames: {
		lowerPlural: string
		plural: string
		singular: string
		lower: string
	}
	drizzleSchema: PgTable
	hasObjRoles?: boolean
	helpText: string
	/**
	 * model name
	 *
	 * can be added later with `npx sly add`
	 * @see https://lucide.dev/icons/
	 * @see https://www.radix-ui.com/icons
	 */
	icon: IconName
	idFieldName: `${T}Id`
	idListFieldName: `${T}Ids`
	name: T
	relations: Partial<Record<ModelName, GenRelationsProps>>
	// biome-ignore lint/suspicious/noExplicitAny: misc
	schema: z.ZodObject<any, any>
	schemaKey: T
	starable?: boolean
} & (
	| {
			detailsUrl: (id: string) => string
			editUrl: (id: string) => string
			inProject: false
			listUrl: () => string
			newUrl: () => string
	  }
	| {
			detailsUrl: (id: string, prdId: string) => string
			editUrl: (id: string, prdId: string) => string
			inProject: true
			listUrl: (prdId: string) => string
			newUrl: (prdId: string) => string
	  }
)

function toTitleCase(input: string): string {
	return input
		.replace(/_/g, ' ')
		.split(' ') // Split the string into words by spaces
		.map(
			(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), // Capitalize the first letter of each word, and make the rest of the letters lowercase
		)
		.join(' ') // Join the words back into a single string
}

export function getDisplayNamesFromCamelCase(camelCase: string): string {
	return camelCase
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (str) => str.toUpperCase())
}

export const genProps = <
	T extends (typeof modelNames)[number],
	P extends boolean,
>(
	name: T,
	options: {
		inProject: P
		isAdmin?: boolean
		namePlural?: string
	},
) => {
	const lowerPlural = options.namePlural
		? options.namePlural
		: `${name.replace(/([A-Z])/g, ' $1')}s`.toLowerCase()

	return {
		displayNames: {
			lower: `${name.replace(/([A-Z])/g, ' $1')}`.toLowerCase(),
			lowerPlural,
			plural: `${toTitleCase(lowerPlural)}` as const,
			singular: getDisplayNamesFromCamelCase(name),
		},
		idFieldName: `${name}Id` as const,
		idListFieldName: `${name}Ids` as const,
		name,
		schemaKey: `${name}` as const,
		...getModelUrls(
			lowerPlural.replace(/_/g, '-'),
			options.inProject,
			options.isAdmin,
		),
	}
}

export function hasMany<MN extends ModelName>(modelName: MN) {
	return {
		[modelName]: {
			cardinality: 'hasMany',
		},
	} as Record<
		MN,
		{
			cardinality: 'hasMany'
		}
	>
}

export function hasOne<MN extends ModelName>(modelName: MN) {
	return {
		[modelName]: {
			cardinality: 'hasOne',
		},
	} as Record<
		MN,
		{
			cardinality: 'hasOne'
		}
	>
}

export function manyToMany<MN extends ModelName, TableSchema extends PgTable>(
	modelName: MN,
	relationTableSchema: TableSchema,
) {
	return {
		[modelName]: {
			cardinality: 'manyToMany',
			relationTableSchema,
		},
	} as Record<
		MN,
		{
			cardinality: 'manyToMany'
			relationTableSchema: TableSchema
		}
	>
}

export type HasOneRelations<
	T extends (typeof models)[keyof typeof models],
	Relations = T['relations'],
> = {
	[K in keyof Relations]: Relations[K] extends { cardinality: 'hasOne' }
		? K
		: never
}[keyof Relations]

export function getHasOneRelations<
	T extends (typeof models)[keyof typeof models],
>(model: T): HasOneRelations<T> {
	const relations = Object.entries(model.relations) as [
		keyof T['relations'],
		GenRelationsProps,
	][]
	const filteredRelations = relations
		.filter(([, relation]) => relation.cardinality === 'hasOne')
		.map(([key]) => key)
	return filteredRelations as unknown as HasOneRelations<T>
}

export type ManyToManyRelations<
	T extends (typeof models)[keyof typeof models],
	Relations = T['relations'],
> = {
	[K in keyof Relations]: Relations[K] extends { cardinality: 'manyToMany' }
		? K
		: never
}[keyof Relations]

export function getMTMRelations<T extends (typeof models)[keyof typeof models]>(
	model: T,
): ManyToManyRelations<T> {
	const relations = Object.entries(model.relations) as [
		keyof T['relations'],
		GenRelationsProps,
	][]
	const filteredRelations = relations
		.filter(([, relation]) => relation.cardinality === 'manyToMany')
		.map(([key]) => key)
	return filteredRelations as unknown as ManyToManyRelations<T>
}

// function snakeCaseToCamelCase<T extends string>(input: T): Camelize<T> {
// 	// Replace each underscore followed by a lowercase letter with the uppercase version of the letter
// 	// The 'g' flag in the regular expression indicates a global search in the string
// 	// The 'match' parameter represents each underscore followed by a lowercase letter found by the regex
// 	return input.replace(/_([a-z])/g, (_, match) =>
// 		match.toUpperCase(),
// 	) as Camelize<T>
// }

export type HasObjRolesModelName = keyof typeof models extends infer K
	? K extends keyof typeof models
		? 'hasObjRoles' extends keyof (typeof models)[K]
			? (typeof models)[K]['hasObjRoles'] extends true
				? K
				: never
			: never
		: never
	: never

export type StarredModelName = keyof typeof models extends infer K
	? K extends keyof typeof models
		? 'starable' extends keyof (typeof models)[K]
			? (typeof models)[K]['starable'] extends true
				? K
				: never
			: never
		: never
	: never

export async function getAcceptedOrAll(
	query: typeof db.query.goal, // or any table
	where: { tenantId: string; prdId?: string },
): Promise<string[]> {
	const accepted = await query.findMany({
		where: { ...where, isAccepted: true },
		columns: { name: true },
	})
	if (accepted.length > 0) return accepted.map((i) => i.name)

	// fallback: return all
	const all = await query.findMany({
		where,
		columns: { name: true },
	})
	return all.map((i) => i.name)
}
