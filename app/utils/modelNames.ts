// should be in camelCase
export const modelNames = [
	'prd',
	'persona',
	'userInterview',
	'goal',
	'story',
	'risk',
	'problem',
	'success_criteria',
	'feature',
	'role',
	'product',
	'prdPersona',
	'share',
	'shareEmail',
	'prdUserInterview',
	'ticket',
] as const

// export const inPlaceAddModels = [
// 	'customer',
// 	'material',

// ] as const satisfies ModelName[]

export type ModelName = (typeof modelNames)[number]

export const searchModels = [
	'persona',
	'prd',
	// 'userEngagement',
] as const satisfies ModelName[]

const _authModels = [
	'persona',
	'prd',
	'userInterview',
	'ticket',
	// 'userEngagement',
] as const satisfies ModelName[]
export type AuthModel = (typeof _authModels)[number]

export const manyToManyRelations = [
	// ['persona', 'userFlow'],
	// ['material', 'persona'],
	// ['material', 'feature'],
	// ['event', 'feature'],
	// ['event', 'persona'],
	// ['training', 'persona'],
	// ['training', 'feature'],
	// ...getTagRelations(modelsWithTags),
] satisfies [ModelName, ModelName][]

// export function getTagRelations<T extends ModelName>(
// 	models: T[],
// ): ['tag', T][] {
// 	return models.map((model) => ['tag', model])
// }
